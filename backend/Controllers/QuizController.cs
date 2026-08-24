using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/cursos/{cursoId:guid}/quiz")]
public class QuizController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ICurrentUserService _currentUser;

    public QuizController(ISupabaseRestClient rest, ICurrentUserService currentUser)
    {
        _rest = rest;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<QuizDto>> Obter(Guid cursoId)
    {
        var quiz = (await _rest.SelectAsync<QuizRow>("quizzes", PostgrestFilter.Eq("curso_id", cursoId))).FirstOrDefault();
        if (quiz is null) return NotFound();

        var perguntas = await _rest.SelectAsync<PerguntaRow>("perguntas", PostgrestFilter.Eq("quiz_id", quiz.Id), order: "ordem.asc");
        var perguntaIds = perguntas.Select(p => p.Id).ToList();

        var alternativas = perguntaIds.Count == 0
            ? new List<AlternativaRow>()
            : await _rest.SelectAsync<AlternativaRow>("alternativas", PostgrestFilter.In("pergunta_id", perguntaIds.Cast<object>()), order: "ordem.asc");

        var minhasRespostas = perguntaIds.Count == 0
            ? new List<RespostaQuizRow>()
            : await _rest.SelectAsync<RespostaQuizRow>("respostas_quiz",
                PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", _currentUser.UserId), PostgrestFilter.In("pergunta_id", perguntaIds.Cast<object>())));
        var respostaPorPergunta = minhasRespostas.ToDictionary(r => r.PerguntaId, r => r.AlternativaId);

        var ehAdmin = _currentUser.IsAdmin;

        var perguntasDto = perguntas.Select(p => new PerguntaDto(
            p.Id,
            p.Enunciado,
            p.Ordem,
            alternativas.Where(a => a.PerguntaId == p.Id)
                .Select(a => new AlternativaDto(a.Id, a.Texto, a.Ordem, ehAdmin ? a.Correta : null))
                .ToList(),
            respostaPorPergunta.GetValueOrDefault(p.Id))).ToList();

        return new QuizDto(quiz.Id, quiz.Titulo, perguntasDto);
    }

    [HttpPut]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<QuizDto>> SubstituirTudo(Guid cursoId, [FromBody] UpsertQuizRequest request)
    {
        var quizExistente = (await _rest.SelectAsync<QuizRow>("quizzes", PostgrestFilter.Eq("curso_id", cursoId))).FirstOrDefault();
        if (quizExistente is not null)
        {
            await _rest.DeleteAsync("quizzes", PostgrestFilter.Eq("id", quizExistente.Id));
        }

        var novoQuiz = await _rest.InsertAsync<QuizRow>("quizzes", new { curso_id = cursoId, titulo = request.Titulo });

        var perguntasDto = new List<PerguntaDto>();
        foreach (var pergunta in request.Perguntas)
        {
            var perguntaCriada = await _rest.InsertAsync<PerguntaRow>("perguntas", new
            {
                quiz_id = novoQuiz.Id,
                enunciado = pergunta.Enunciado,
                ordem = pergunta.Ordem
            });

            var alternativasPayload = pergunta.Alternativas
                .Select(a => (object)new { pergunta_id = perguntaCriada.Id, texto = a.Texto, correta = a.Correta, ordem = a.Ordem });
            var alternativasCriadas = await _rest.InsertManyAsync<AlternativaRow>("alternativas", alternativasPayload);

            perguntasDto.Add(new PerguntaDto(
                perguntaCriada.Id,
                perguntaCriada.Enunciado,
                perguntaCriada.Ordem,
                alternativasCriadas.Select(a => new AlternativaDto(a.Id, a.Texto, a.Ordem, a.Correta)).ToList(),
                null));
        }

        return new QuizDto(novoQuiz.Id, novoQuiz.Titulo, perguntasDto);
    }

    [HttpPost("responder/{perguntaId:guid}")]
    public async Task<ActionResult<ResponderPerguntaResponse>> Responder(Guid cursoId, Guid perguntaId, [FromBody] ResponderPerguntaRequest request)
    {
        var alternativa = await _rest.GetByIdAsync<AlternativaRow>("alternativas", request.AlternativaId);
        if (alternativa is null || alternativa.PerguntaId != perguntaId) return BadRequest(new { message = "Alternativa inválida." });

        await _rest.UpsertAsync<RespostaQuizRow>("respostas_quiz", new
        {
            aluno_id = _currentUser.UserId,
            pergunta_id = perguntaId,
            alternativa_id = request.AlternativaId,
            respondido_em = DateTimeOffset.UtcNow
        }, "aluno_id,pergunta_id");

        var alternativaCorreta = (await _rest.SelectAsync<AlternativaRow>("alternativas", PostgrestFilter.Eq("pergunta_id", perguntaId)))
            .First(a => a.Correta);

        return new ResponderPerguntaResponse(alternativa.Correta, alternativaCorreta.Id);
    }
}
