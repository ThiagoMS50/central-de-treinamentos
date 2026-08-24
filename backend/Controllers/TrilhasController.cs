using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/trilhas")]
public class TrilhasController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ICurrentUserService _currentUser;

    public TrilhasController(ISupabaseRestClient rest, ICurrentUserService currentUser)
    {
        _rest = rest;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<List<TrilhaListItemDto>>> Listar()
    {
        var trilhas = await _rest.SelectAsync<TrilhaRow>("trilhas", order: "created_at.asc");
        var vinculos = await _rest.SelectAsync<CursoTrilhaRow>("curso_trilhas");
        var minhasMatriculas = await _rest.SelectAsync<MatriculaRow>("matriculas", PostgrestFilter.Eq("aluno_id", _currentUser.UserId));
        var concluidoPorCurso = minhasMatriculas.Where(m => m.ConcluidoEm.HasValue).Select(m => m.CursoId).ToHashSet();

        var resultado = new List<TrilhaListItemDto>();
        foreach (var trilha in trilhas)
        {
            var cursoIds = vinculos.Where(v => v.TrilhaId == trilha.Id).Select(v => v.CursoId).ToList();
            var total = cursoIds.Count;
            var concluidos = cursoIds.Count(id => concluidoPorCurso.Contains(id));
            var progresso = total == 0 ? 0 : (double)concluidos / total * 100;
            resultado.Add(new TrilhaListItemDto(trilha.Id, trilha.Titulo, trilha.Descricao, total, concluidos, progresso, total > 0 && concluidos == total));
        }

        return resultado;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrilhaDetailDto>> Detalhe(Guid id)
    {
        var trilha = await _rest.GetByIdAsync<TrilhaRow>("trilhas", id);
        if (trilha is null) return NotFound();

        var vinculos = await _rest.SelectAsync<CursoTrilhaRow>("curso_trilhas", PostgrestFilter.Eq("trilha_id", id), order: "ordem.asc");
        var cursoIds = vinculos.Select(v => v.CursoId).ToList();
        var cursos = cursoIds.Count == 0
            ? new List<CursoRow>()
            : await _rest.SelectAsync<CursoRow>("cursos", PostgrestFilter.In("id", cursoIds.Cast<object>()));
        var cursosPorId = cursos.ToDictionary(c => c.Id);

        var minhasMatriculas = cursoIds.Count == 0
            ? new List<MatriculaRow>()
            : await _rest.SelectAsync<MatriculaRow>("matriculas",
                PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", _currentUser.UserId), PostgrestFilter.In("curso_id", cursoIds.Cast<object>())));
        var matriculaPorCurso = minhasMatriculas.ToDictionary(m => m.CursoId);

        var cursosDto = vinculos.Select(v =>
        {
            var status = matriculaPorCurso.TryGetValue(v.CursoId, out var m)
                ? (m.ConcluidoEm.HasValue ? "concluido" : "em_andamento")
                : "nao_iniciado";
            var titulo = cursosPorId.TryGetValue(v.CursoId, out var curso) ? curso.Titulo : "?";
            return new TrilhaCursoDto(v.CursoId, titulo, v.Ordem, status);
        }).ToList();

        var total = cursosDto.Count;
        var concluidos = cursosDto.Count(c => c.Status == "concluido");
        var progresso = total == 0 ? 0 : (double)concluidos / total * 100;

        return new TrilhaDetailDto(trilha.Id, trilha.Titulo, trilha.Descricao, total, concluidos, progresso,
            total > 0 && concluidos == total, cursosDto);
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TrilhaListItemDto>> Criar([FromBody] CreateOrUpdateTrilhaRequest request)
    {
        var criada = await _rest.InsertAsync<TrilhaRow>("trilhas", new { titulo = request.Titulo, descricao = request.Descricao });
        return new TrilhaListItemDto(criada.Id, criada.Titulo, criada.Descricao, 0, 0, 0, false);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<TrilhaListItemDto>> Atualizar(Guid id, [FromBody] CreateOrUpdateTrilhaRequest request)
    {
        var atualizada = await _rest.UpdateAsync<TrilhaRow>("trilhas", PostgrestFilter.Eq("id", id),
            new { titulo = request.Titulo, descricao = request.Descricao });
        if (atualizada is null) return NotFound();
        return new TrilhaListItemDto(atualizada.Id, atualizada.Titulo, atualizada.Descricao, 0, 0, 0, false);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Excluir(Guid id)
    {
        await _rest.DeleteAsync("trilhas", PostgrestFilter.Eq("id", id));
        return NoContent();
    }

    [HttpPut("{id:guid}/cursos")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> DefinirCursos(Guid id, [FromBody] SetTrilhaCursosRequest request)
    {
        var trilha = await _rest.GetByIdAsync<TrilhaRow>("trilhas", id);
        if (trilha is null) return NotFound();

        await _rest.DeleteAsync("curso_trilhas", PostgrestFilter.Eq("trilha_id", id));

        if (request.Cursos.Count > 0)
        {
            var payloads = request.Cursos.Select(c => (object)new { curso_id = c.CursoId, trilha_id = id, ordem = c.Ordem });
            await _rest.InsertManyAsync<CursoTrilhaRow>("curso_trilhas", payloads);
        }

        return NoContent();
    }
}
