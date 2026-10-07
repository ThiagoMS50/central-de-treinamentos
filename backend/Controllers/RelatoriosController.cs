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
[Authorize(Roles = RoleNames.Admin)]
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
        var filtro = MontarFiltro(periodoInicio, periodoFim, cursoId, usuarioId);
        return await _relatorios.GerarDashboardAsync(filtro);
    }

    [HttpGet("por-aluno")]
    public async Task<ActionResult<List<AlunoResumoDto>>> PorAluno()
    {
        return await _relatorios.GerarResumoPorAlunoAsync();
    }

    [HttpGet("export.csv")]
    public async Task<IActionResult> ExportarCsv(
        [FromQuery] DateTimeOffset? periodoInicio,
        [FromQuery] DateTimeOffset? periodoFim,
        [FromQuery] Guid? cursoId,
        [FromQuery] Guid? usuarioId)
    {
        var filtro = MontarFiltro(periodoInicio, periodoFim, cursoId, usuarioId);
        var csvBytes = await _relatorios.GerarCsvAsync(filtro);
        return File(csvBytes, "text/csv", "relatorio.csv");
    }
}
