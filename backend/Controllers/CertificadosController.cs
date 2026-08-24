using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/certificados")]
public class CertificadosController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ICurrentUserService _currentUser;
    private readonly ProgressoService _progresso;
    private readonly CertificadoPdfService _pdf;

    public CertificadosController(ISupabaseRestClient rest, ICurrentUserService currentUser, ProgressoService progresso, CertificadoPdfService pdf)
    {
        _rest = rest;
        _currentUser = currentUser;
        _progresso = progresso;
        _pdf = pdf;
    }

    private static string GerarCodigo() =>
        Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .ToUpperInvariant()
            .Where(char.IsLetterOrDigit)
            .Take(10)
            .Aggregate(string.Empty, (acc, c) => acc + c);

    [HttpPost("curso/{cursoId:guid}")]
    public async Task<IActionResult> GerarParaCurso(Guid cursoId)
    {
        var curso = await _rest.GetByIdAsync<CursoRow>("cursos", cursoId);
        if (curso is null) return NotFound();

        var matricula = (await _rest.SelectAsync<MatriculaRow>("matriculas",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", _currentUser.UserId), PostgrestFilter.Eq("curso_id", cursoId)))).FirstOrDefault();
        if (matricula?.ConcluidoEm is null)
            return Conflict(new { message = "Curso ainda não foi concluído." });

        var existente = (await _rest.SelectAsync<CertificadoRow>("certificados",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", _currentUser.UserId), PostgrestFilter.Eq("curso_id", cursoId)))).FirstOrDefault();

        var certificado = existente ?? await _rest.InsertAsync<CertificadoRow>("certificados", new
        {
            aluno_id = _currentUser.UserId,
            curso_id = cursoId,
            codigo_validacao = GerarCodigo()
        });

        var pdfBytes = _pdf.Gerar(new CertificadoPdfModel
        {
            NomeAluno = _currentUser.Nome ?? _currentUser.Email,
            EhTrilha = false,
            Titulo = curso.Titulo,
            CargaHorariaHoras = curso.CargaHorariaHoras,
            DataConclusao = matricula.ConcluidoEm.Value,
            CodigoValidacao = certificado.CodigoValidacao
        });

        return File(pdfBytes, "application/pdf", $"certificado-{curso.Titulo}.pdf");
    }

    [HttpPost("trilha/{trilhaId:guid}")]
    public async Task<IActionResult> GerarParaTrilha(Guid trilhaId)
    {
        var trilha = await _rest.GetByIdAsync<TrilhaRow>("trilhas", trilhaId);
        if (trilha is null) return NotFound();

        var completa = await _progresso.TrilhaEstaCompletaAsync(_currentUser.UserId, trilhaId);
        if (!completa) return Conflict(new { message = "Trilha ainda não foi concluída." });

        var vinculos = await _rest.SelectAsync<CursoTrilhaRow>("curso_trilhas", PostgrestFilter.Eq("trilha_id", trilhaId));
        var cursoIds = vinculos.Select(v => v.CursoId).ToList();
        var cursos = cursoIds.Count == 0
            ? new List<CursoRow>()
            : await _rest.SelectAsync<CursoRow>("cursos", PostgrestFilter.In("id", cursoIds.Cast<object>()));
        var cargaHorariaTotal = cursos.Sum(c => c.CargaHorariaHoras);

        var minhasMatriculas = cursoIds.Count == 0
            ? new List<MatriculaRow>()
            : await _rest.SelectAsync<MatriculaRow>("matriculas",
                PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", _currentUser.UserId), PostgrestFilter.In("curso_id", cursoIds.Cast<object>())));
        var dataConclusao = minhasMatriculas.Where(m => m.ConcluidoEm.HasValue).Select(m => m.ConcluidoEm!.Value)
            .DefaultIfEmpty(DateTimeOffset.UtcNow).Max();

        var existente = (await _rest.SelectAsync<CertificadoRow>("certificados",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", _currentUser.UserId), PostgrestFilter.Eq("trilha_id", trilhaId)))).FirstOrDefault();

        var certificado = existente ?? await _rest.InsertAsync<CertificadoRow>("certificados", new
        {
            aluno_id = _currentUser.UserId,
            trilha_id = trilhaId,
            codigo_validacao = GerarCodigo()
        });

        var pdfBytes = _pdf.Gerar(new CertificadoPdfModel
        {
            NomeAluno = _currentUser.Nome ?? _currentUser.Email,
            EhTrilha = true,
            Titulo = trilha.Titulo,
            CargaHorariaHoras = cargaHorariaTotal,
            DataConclusao = dataConclusao,
            CodigoValidacao = certificado.CodigoValidacao
        });

        return File(pdfBytes, "application/pdf", $"certificado-{trilha.Titulo}.pdf");
    }

    [HttpGet("minhas")]
    public async Task<ActionResult<List<CertificadoListItemDto>>> Minhas()
    {
        var certificados = await _rest.SelectAsync<CertificadoRow>("certificados", PostgrestFilter.Eq("aluno_id", _currentUser.UserId));

        var cursoIds = certificados.Where(c => c.CursoId.HasValue).Select(c => c.CursoId!.Value).ToList();
        var trilhaIds = certificados.Where(c => c.TrilhaId.HasValue).Select(c => c.TrilhaId!.Value).ToList();

        var cursos = cursoIds.Count == 0 ? new List<CursoRow>() : await _rest.SelectAsync<CursoRow>("cursos", PostgrestFilter.In("id", cursoIds.Cast<object>()));
        var trilhas = trilhaIds.Count == 0 ? new List<TrilhaRow>() : await _rest.SelectAsync<TrilhaRow>("trilhas", PostgrestFilter.In("id", trilhaIds.Cast<object>()));
        var cursosPorId = cursos.ToDictionary(c => c.Id);
        var trilhasPorId = trilhas.ToDictionary(t => t.Id);

        return certificados.Select(c => new CertificadoListItemDto(
            c.Id,
            c.CursoId.HasValue ? "curso" : "trilha",
            c.CursoId.HasValue ? cursosPorId.GetValueOrDefault(c.CursoId.Value)?.Titulo ?? "?" : trilhasPorId.GetValueOrDefault(c.TrilhaId!.Value)?.Titulo ?? "?",
            c.EmitidoEm,
            c.CodigoValidacao)).ToList();
    }

    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> BaixarPorId(Guid id)
    {
        var certificado = await _rest.GetByIdAsync<CertificadoRow>("certificados", id);
        if (certificado is null) return NotFound();
        if (certificado.AlunoId != _currentUser.UserId && !_currentUser.IsAdmin) return Forbid();

        var aluno = await _rest.GetByIdAsync<ProfileRow>("profiles", certificado.AlunoId);

        if (certificado.CursoId.HasValue)
        {
            var curso = await _rest.GetByIdAsync<CursoRow>("cursos", certificado.CursoId.Value);
            if (curso is null) return NotFound();
            var matricula = (await _rest.SelectAsync<MatriculaRow>("matriculas",
                PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", certificado.AlunoId), PostgrestFilter.Eq("curso_id", certificado.CursoId.Value)))).FirstOrDefault();

            var pdfBytes = _pdf.Gerar(new CertificadoPdfModel
            {
                NomeAluno = aluno?.Nome ?? "?",
                EhTrilha = false,
                Titulo = curso.Titulo,
                CargaHorariaHoras = curso.CargaHorariaHoras,
                DataConclusao = matricula?.ConcluidoEm ?? certificado.EmitidoEm,
                CodigoValidacao = certificado.CodigoValidacao
            });
            return File(pdfBytes, "application/pdf", $"certificado-{curso.Titulo}.pdf");
        }
        else
        {
            var trilha = await _rest.GetByIdAsync<TrilhaRow>("trilhas", certificado.TrilhaId!.Value);
            if (trilha is null) return NotFound();
            var vinculos = await _rest.SelectAsync<CursoTrilhaRow>("curso_trilhas", PostgrestFilter.Eq("trilha_id", trilha.Id));
            var cursoIds = vinculos.Select(v => v.CursoId).ToList();
            var cursos = cursoIds.Count == 0 ? new List<CursoRow>() : await _rest.SelectAsync<CursoRow>("cursos", PostgrestFilter.In("id", cursoIds.Cast<object>()));

            var pdfBytes = _pdf.Gerar(new CertificadoPdfModel
            {
                NomeAluno = aluno?.Nome ?? "?",
                EhTrilha = true,
                Titulo = trilha.Titulo,
                CargaHorariaHoras = cursos.Sum(c => c.CargaHorariaHoras),
                DataConclusao = certificado.EmitidoEm,
                CodigoValidacao = certificado.CodigoValidacao
            });
            return File(pdfBytes, "application/pdf", $"certificado-{trilha.Titulo}.pdf");
        }
    }

    [HttpGet("validar/{codigo}")]
    [AllowAnonymous]
    public async Task<ActionResult<ValidarCertificadoResponse>> Validar(string codigo)
    {
        var certificado = (await _rest.SelectAsync<CertificadoRow>("certificados", PostgrestFilter.Eq("codigo_validacao", codigo))).FirstOrDefault();
        if (certificado is null) return NotFound();

        var aluno = await _rest.GetByIdAsync<ProfileRow>("profiles", certificado.AlunoId);
        string titulo;
        string tipo;
        if (certificado.CursoId.HasValue)
        {
            tipo = "curso";
            titulo = (await _rest.GetByIdAsync<CursoRow>("cursos", certificado.CursoId.Value))?.Titulo ?? "?";
        }
        else
        {
            tipo = "trilha";
            titulo = (await _rest.GetByIdAsync<TrilhaRow>("trilhas", certificado.TrilhaId!.Value))?.Titulo ?? "?";
        }

        return new ValidarCertificadoResponse(aluno?.Nome ?? "?", tipo, titulo, certificado.EmitidoEm);
    }
}
