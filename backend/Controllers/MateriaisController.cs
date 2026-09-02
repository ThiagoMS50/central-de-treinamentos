using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/aulas/{aulaId:guid}/materiais")]
public class MateriaisController : ControllerBase
{
    private const string Bucket = "materiais-cursos";

    private readonly ISupabaseRestClient _rest;
    private readonly ISupabaseStorageClient _storage;

    public MateriaisController(ISupabaseRestClient rest, ISupabaseStorageClient storage)
    {
        _rest = rest;
        _storage = storage;
    }

    [HttpGet]
    public async Task<ActionResult<List<MaterialDto>>> Listar(Guid aulaId)
    {
        var materiais = await _rest.SelectAsync<MaterialRow>("materiais", PostgrestFilter.Eq("aula_id", aulaId), order: "ordem.asc");
        return materiais.Select(m => new MaterialDto(m.Id, m.Titulo, m.Ordem)).ToList();
    }

    [HttpGet("{materialId:guid}/download")]
    public async Task<ActionResult<MaterialDownloadDto>> Download(Guid aulaId, Guid materialId)
    {
        var material = await _rest.GetByIdAsync<MaterialRow>("materiais", materialId);
        if (material is null || material.AulaId != aulaId) return NotFound();

        var url = await _storage.CreateSignedUrlAsync(Bucket, material.StoragePath, expiresInSeconds: 300);
        return new MaterialDownloadDto(url);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    [RequestSizeLimit(50_000_000)]
    public async Task<ActionResult<MaterialDto>> Upload(Guid aulaId, [FromForm] string titulo, [FromForm] int ordem, [FromForm] IFormFile arquivo)
    {
        if (arquivo.Length == 0) return BadRequest(new { message = "Arquivo vazio." });

        var caminho = $"{aulaId}/{Guid.NewGuid()}-{arquivo.FileName}";
        await using (var stream = arquivo.OpenReadStream())
        {
            await _storage.UploadAsync(Bucket, caminho, stream, arquivo.ContentType);
        }

        var criado = await _rest.InsertAsync<MaterialRow>("materiais", new
        {
            aula_id = aulaId,
            titulo,
            storage_path = caminho,
            ordem
        });

        return new MaterialDto(criado.Id, criado.Titulo, criado.Ordem);
    }

    [HttpPut("{materialId:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<MaterialDto>> Atualizar(Guid aulaId, Guid materialId, [FromBody] AtualizarMaterialRequest request)
    {
        var atualizado = await _rest.UpdateAsync<MaterialRow>("materiais", PostgrestFilter.Eq("id", materialId),
            new { titulo = request.Titulo, ordem = request.Ordem });
        if (atualizado is null) return NotFound();
        return new MaterialDto(atualizado.Id, atualizado.Titulo, atualizado.Ordem);
    }

    [HttpDelete("{materialId:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Excluir(Guid aulaId, Guid materialId)
    {
        var material = await _rest.GetByIdAsync<MaterialRow>("materiais", materialId);
        if (material is null) return NotFound();

        try { await _storage.DeleteAsync(Bucket, material.StoragePath); }
        catch (SupabaseRestException) { /* melhor esforço */ }

        await _rest.DeleteAsync("materiais", PostgrestFilter.Eq("id", materialId));
        return NoContent();
    }
}

public record AtualizarMaterialRequest(string Titulo, int Ordem);
