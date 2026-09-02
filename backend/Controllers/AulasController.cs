using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api")]
public class AulasController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ISupabaseStorageClient _storage;
    private readonly ICurrentUserService _currentUser;
    private readonly ProgressoService _progresso;

    public AulasController(ISupabaseRestClient rest, ISupabaseStorageClient storage, ICurrentUserService currentUser, ProgressoService progresso)
    {
        _rest = rest;
        _storage = storage;
        _currentUser = currentUser;
        _progresso = progresso;
    }

    [HttpPost("cursos/{cursoId:guid}/aulas")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<AulaDto>> Criar(Guid cursoId, [FromBody] CreateOrUpdateAulaRequest request)
    {
        var criada = await _rest.InsertAsync<AulaRow>("aulas", new
        {
            curso_id = cursoId,
            titulo = request.Titulo,
            ordem = request.Ordem
        });

        return new AulaDto(criada.Id, criada.Titulo, criada.Ordem, false, new List<MaterialDto>());
    }

    // Renomear e/ou reordenar (usado pelos botões de mover pra cima/baixo no Admin).
    [HttpPut("aulas/{aulaId:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<AulaDto>> Atualizar(Guid aulaId, [FromBody] CreateOrUpdateAulaRequest request)
    {
        var atualizada = await _rest.UpdateAsync<AulaRow>("aulas", PostgrestFilter.Eq("id", aulaId),
            new { titulo = request.Titulo, ordem = request.Ordem });
        if (atualizada is null) return NotFound();
        return new AulaDto(atualizada.Id, atualizada.Titulo, atualizada.Ordem, false, new List<MaterialDto>());
    }

    [HttpDelete("aulas/{aulaId:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Excluir(Guid aulaId)
    {
        var materiais = await _rest.SelectAsync<MaterialRow>("materiais", PostgrestFilter.Eq("aula_id", aulaId));
        foreach (var material in materiais)
        {
            try { await _storage.DeleteAsync("materiais-cursos", material.StoragePath); }
            catch (SupabaseRestException) { /* melhor esforço — a linha da aula será apagada de qualquer forma */ }
        }

        await _rest.DeleteAsync("aulas", PostgrestFilter.Eq("id", aulaId));
        return NoContent();
    }

    // Aluno marca a aula como concluída; quando essa era a última pendente do curso, o curso
    // inteiro é dado como concluído (pontos/badges/certificado/trilhas, ver ProgressoService).
    [HttpPost("aulas/{aulaId:guid}/concluir")]
    public async Task<ActionResult<ConcluirAulaResponse>> Concluir(Guid aulaId)
    {
        try
        {
            return await _progresso.MarcarAulaConcluidaAsync(_currentUser.UserId, aulaId);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
