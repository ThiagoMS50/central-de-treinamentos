using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/relatorios")]
[Authorize(Roles = RoleNames.GestorOuAdmin)]
public class RelatoriosController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ICurrentUserService _currentUser;
    private readonly RelatorioService _relatorios;

    public RelatoriosController(ISupabaseRestClient rest, ICurrentUserService currentUser, RelatorioService relatorios)
    {
        _rest = rest;
        _currentUser = currentUser;
        _relatorios = relatorios;
    }

    // Gestor sempre é restrito à própria equipe (calculada a partir do token, nunca de um
    // parâmetro vindo do frontend); admin vê todo mundo (escopo nulo = sem filtro de aluno).
    private async Task<List<Guid>?> ResolverEscopoAsync()
    {
        if (_currentUser.IsAdmin) return null;

        var equipe = await _rest.SelectAsync<ProfileRow>("profiles", PostgrestFilter.Eq("manager_id", _currentUser.UserId));
        return equipe.Select(p => p.Id).ToList();
    }

    private static RelatorioFiltro MontarFiltro(DateTimeOffset? periodoInicio, DateTimeOffset? periodoFim, Guid? cursoId, Guid? usuarioId) => new()
    {
        PeriodoInicio = periodoInicio,
        PeriodoFim = periodoFim,
        CursoId = cursoId,
        UsuarioId = usuarioId
    };

    [HttpGet("dashboard")]
    public async Task<ActionResult<RelatorioDashboardDto>> Dashboard(
        [FromQuery] DateTimeOffset? periodoInicio,
        [FromQuery] DateTimeOffset? periodoFim,
        [FromQuery] Guid? cursoId,
        [FromQuery] Guid? usuarioId)
    {
        var escopo = await ResolverEscopoAsync();
        var filtro = MontarFiltro(periodoInicio, periodoFim, cursoId, usuarioId);
        var dashboard = await _relatorios.GerarDashboardAsync(filtro, escopo);
        return dashboard;
    }

    [HttpGet("por-aluno")]
    public async Task<ActionResult<List<AlunoResumoDto>>> PorAluno()
    {
        var escopo = await ResolverEscopoAsync();
        return await _relatorios.GerarResumoPorAlunoAsync(escopo);
    }

    [HttpGet("export.csv")]
    public async Task<IActionResult> ExportarCsv(
        [FromQuery] DateTimeOffset? periodoInicio,
        [FromQuery] DateTimeOffset? periodoFim,
        [FromQuery] Guid? cursoId,
        [FromQuery] Guid? usuarioId)
    {
        var escopo = await ResolverEscopoAsync();
        var filtro = MontarFiltro(periodoInicio, periodoFim, cursoId, usuarioId);
        var csvBytes = await _relatorios.GerarCsvAsync(filtro, escopo);
        return File(csvBytes, "text/csv", "relatorio.csv");
    }
}
