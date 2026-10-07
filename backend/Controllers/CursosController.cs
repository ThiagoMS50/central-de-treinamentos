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
    private readonly CapaService _capas;

    public CursosController(ISupabaseRestClient rest, ISupabaseStorageClient storage, ICurrentUserService currentUser, ProgressoService progresso, CapaService capas)
    {
        _rest = rest;
        _storage = storage;
        _currentUser = currentUser;
        _progresso = progresso;
        _capas = capas;
    }

    private CursoListItemDto ToListItemDto(CursoRow curso, MatriculaRow? matricula)
    {
        var (status, prazoStatus, prazoEm) = ProgressoService.CalcularStatus(curso, matricula);
        return new CursoListItemDto(curso.Id, curso.Titulo, curso.Descricao, curso.CargaHorariaHoras,
            curso.TemPrazo, curso.PrazoDias, status, prazoStatus, prazoEm, _capas.Url(curso.CapaPath));
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

        var matricula = _currentUser.IsAdmin
            ? await _progresso.GetMatriculaAsync(_currentUser.UserId, id)
            : await _progresso.GetOrCreateMatriculaAsync(_currentUser.UserId, id);
        var (status, prazoStatus, prazoEm) = ProgressoService.CalcularStatus(curso, matricula);

        var aulas = await _progresso.ObterAulasComProgressoAsync(id, _currentUser.UserId);
        var quizzes = await _rest.SelectAsync<QuizRow>("quizzes", PostgrestFilter.Eq("curso_id", id));

        return new CursoDetailDto(
            curso.Id, curso.Titulo, curso.Descricao, curso.CargaHorariaHoras,
            curso.TemPrazo, curso.PrazoDias, status, prazoStatus, prazoEm,
            quizzes.Count > 0,
            aulas,
            _capas.Url(curso.CapaPath));
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
        var aulas = await _rest.SelectAsync<AulaRow>("aulas", PostgrestFilter.Eq("curso_id", id));
        if (aulas.Count > 0)
        {
            var aulaIds = aulas.Select(a => a.Id).Cast<object>().ToList();
            var materiais = await _rest.SelectAsync<MaterialRow>("materiais", PostgrestFilter.In("aula_id", aulaIds));
            foreach (var material in materiais)
            {
                try { await _storage.DeleteAsync("materiais-cursos", material.StoragePath); }
                catch (SupabaseRestException) { /* melhor esforço — a linha do curso será apagada de qualquer forma */ }
            }
        }

        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", id);
        await _rest.DeleteAsync("cursos", PostgrestFilter.Eq("id", id));
        await _capas.RemoverAsync(curso?.CapaPath);
        return NoContent();
    }

    // Envia (ou troca) a imagem de capa do curso. A capa anterior é apagada do Storage.
    [HttpPost("{id:guid}/capa")]
    [Authorize(Roles = RoleNames.Admin)]
    [RequestSizeLimit(6_000_000)]
    public async Task<ActionResult<CapaDto>> EnviarCapa(Guid id, IFormFile? arquivo)
    {
        var erro = CapaService.Validar(arquivo);
        if (erro is not null) return BadRequest(new { message = erro });

        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", id);
        if (curso is null) return NotFound();

        var caminho = await _capas.EnviarAsync("cursos", id, arquivo!);
        await _rest.UpdateAsync<CursoRow>("cursos", PostgrestFilter.Eq("id", id), new { capa_path = caminho });
        await _capas.RemoverAsync(curso.CapaPath);

        return new CapaDto(_capas.Url(caminho));
    }

    // Usa uma imagem da galeria como capa (a imagem da galeria é compartilhada e não é apagada).
    [HttpPut("{id:guid}/capa/galeria")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<CapaDto>> EscolherCapaDaGaleria(Guid id, [FromBody] EscolherCapaGaleriaRequest request)
    {
        var caminho = await _capas.CaminhoDaGaleriaAsync(request.Nome);
        if (caminho is null) return BadRequest(new { message = "Imagem não encontrada na galeria." });

        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", id);
        if (curso is null) return NotFound();

        await _rest.UpdateAsync<CursoRow>("cursos", PostgrestFilter.Eq("id", id), new { capa_path = caminho });
        await _capas.RemoverAsync(curso.CapaPath);

        return new CapaDto(_capas.Url(caminho));
    }

    // Remove a capa: o curso volta a usar a ilustração padrão.
    [HttpDelete("{id:guid}/capa")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<CapaDto>> RemoverCapa(Guid id)
    {
        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", id);
        if (curso is null) return NotFound();

        await _rest.UpdateAsync<CursoRow>("cursos", PostgrestFilter.Eq("id", id), new { capa_path = (string?)null });
        await _capas.RemoverAsync(curso.CapaPath);

        return new CapaDto(null);
    }
}
