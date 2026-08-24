namespace LmsApi.Dtos;

// "Correta" só vem preenchido quando quem pede é admin (aluno não recebe o gabarito).
public record AlternativaDto(Guid Id, string Texto, int Ordem, bool? Correta);

public record PerguntaDto(Guid Id, string Enunciado, int Ordem, List<AlternativaDto> Alternativas, Guid? MinhaResposta);

public record QuizDto(Guid? QuizId, string Titulo, List<PerguntaDto> Perguntas);

// Substitui o quiz inteiro do curso (mais simples que CRUD incremental por pergunta/alternativa).
public record UpsertAlternativaRequest(string Texto, bool Correta, int Ordem);

public record UpsertPerguntaRequest(string Enunciado, int Ordem, List<UpsertAlternativaRequest> Alternativas);

public record UpsertQuizRequest(string Titulo, List<UpsertPerguntaRequest> Perguntas);

public record ResponderPerguntaRequest(Guid AlternativaId);

public record ResponderPerguntaResponse(bool Correta, Guid AlternativaCorretaId);
