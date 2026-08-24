using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/cursos")]
public class CursosController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ISupabaseStorageClient _storage;
    private readonly ICurrentUserService _currentUser;
    private readonly ProgressoService _progresso;

    public CursosController(ISupabaseRestClient rest, ISupabaseStorageClient storage, ICurrentUserService currentUser, ProgressoService progresso)
    {
        _rest = rest;
        _storage = storage;
        _currentUser = currentUser;
        _progresso = progresso;
    }

    private static (string status, string? prazoStatus, DateTimeOffset? prazoEm) CalcularStatus(CursoRow curso, MatriculaRow? matricula)
    {
        if (matricula is null) return ("nao_iniciado", null, null);
        if (matricula.ConcluidoEm.HasValue) return ("concluido", null, null);

        if (!curso.TemPrazo || curso.PrazoDias is null) return ("em_andamento", null, null);

        var prazoEm = matricula.IniciadoEm.AddDays(curso.PrazoDias.Value);
        var prazoStatus = DateTimeOffset.UtcNow > prazoEm ? "atrasado" : "em_dia";
        return ("em_andamento", prazoStatus, prazoEm);
    }

    private static CursoListItemDto ToListItemDto(CursoRow curso, MatriculaRow? matricula)
    {
        var (status, prazoStatus, prazoEm) = CalcularStatus(curso, matricula);
        return new CursoListItemDto(curso.Id, curso.Titulo, curso.Descricao, curso.CargaHorariaHoras,
            curso.TemPrazo, curso.PrazoDias, status, prazoStatus, prazoEm);
    }

    [HttpGet]
    public async Task<ActionResult<List<CursoListItemDto>>> Listar()
    {
        var cursos = await _rest.SelectAsync<CursoRow>("cursos", order: "created_at.asc");
        var minhasMatriculas = await _rest.SelectAsync<MatriculaRow>("matriculas", PostgrestFilter.Eq("aluno_id", _currentUser.UserId));
        var matriculasPorCurso = minhasMatriculas.ToDictionary(m => m.CursoId);

        return cursos.Select(c => ToListItemDto(c, matriculasPorCurso.GetValueOrDefault(c.Id))).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CursoDetailDto>> Detalhe(Guid id)
    {
        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", id);
        if (curso is null) return NotFound();

        var matricula = await _progresso.GetOrCreateMatriculaAsync(_currentUser.UserId, id);
        var (status, prazoStatus, prazoEm) = CalcularStatus(curso, matricula);

        var materiais = await _rest.SelectAsync<MaterialRow>("materiais", PostgrestFilter.Eq("curso_id", id), order: "ordem.asc");
        var quizzes = await _rest.SelectAsync<QuizRow>("quizzes", PostgrestFilter.Eq("curso_id", id));

        return new CursoDetailDto(
            curso.Id, curso.Titulo, curso.Descricao, curso.CargaHorariaHoras,
            curso.TemPrazo, curso.PrazoDias, status, prazoStatus, prazoEm,
            quizzes.Count > 0,
            materiais.Select(m => new MaterialDto(m.Id, m.Titulo, m.Ordem)).ToList());
    }

    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<CursoListItemDto>> Criar([FromBody] CreateOrUpdateCursoRequest request)
    {
        var criado = await _rest.InsertAsync<CursoRow>("cursos", new
        {
            titulo = request.Titulo,
            descricao = request.Descricao,
            carga_horaria_horas = request.CargaHorariaHoras,
            tem_prazo = request.TemPrazo,
            prazo_dias = request.PrazoDias
        });

        return ToListItemDto(criado, null);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<CursoListItemDto>> Atualizar(Guid id, [FromBody] CreateOrUpdateCursoRequest request)
    {
        var atualizado = await _rest.UpdateAsync<CursoRow>("cursos", PostgrestFilter.Eq("id", id), new
        {
            titulo = request.Titulo,
            descricao = request.Descricao,
            carga_horaria_horas = request.CargaHorariaHoras,
            tem_prazo = request.TemPrazo,
            prazo_dias = request.PrazoDias
        });

        if (atualizado is null) return NotFound();
        return ToListItemDto(atualizado, null);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Excluir(Guid id)
    {
        var materiais = await _rest.SelectAsync<MaterialRow>("materiais", PostgrestFilter.Eq("curso_id", id));
        foreach (var material in materiais)
        {
            try { await _storage.DeleteAsync("materiais-cursos", material.StoragePath); }
            catch (SupabaseRestException) { /* melhor esforço — a linha do curso será apagada de qualquer forma */ }
        }

        await _rest.DeleteAsync("cursos", PostgrestFilter.Eq("id", id));
        return NoContent();
    }

    [HttpPost("{id:guid}/concluir")]
    public async Task<ActionResult<ConcluirCursoResponse>> Concluir(Guid id)
    {
        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", id);
        if (curso is null) return NotFound();

        var trilhasCompletas = await _progresso.MarcarConcluidoAsync(_currentUser.UserId, id);
        return new ConcluirCursoResponse(true, trilhasCompletas);
    }
}
