namespace LmsApi.Dtos;

// status: "nao_iniciado" | "em_andamento" | "concluido"
// prazoStatus: null | "em_dia" | "atrasado" (só quando o curso tem prazo)
public record CursoListItemDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    decimal CargaHorariaHoras,
    bool TemPrazo,
    int? PrazoDias,
    string Status,
    string? PrazoStatus,
    DateTimeOffset? PrazoEm);

public record MaterialDto(Guid Id, string Titulo, int Ordem);

public record CursoDetailDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    decimal CargaHorariaHoras,
    bool TemPrazo,
    int? PrazoDias,
    string Status,
    string? PrazoStatus,
    DateTimeOffset? PrazoEm,
    bool TemQuiz,
    List<MaterialDto> Materiais);

public record CreateOrUpdateCursoRequest(
    string Titulo,
    string? Descricao,
    decimal CargaHorariaHoras,
    bool TemPrazo,
    int? PrazoDias);

public record MaterialDownloadDto(string Url);

// Status de um curso para um aluno específico — usado no acompanhamento de progresso
// (Administração/Gestor), com as mesmas convenções de Status/PrazoStatus acima.
public record ProgressoCursoDto(
    Guid CursoId,
    string Titulo,
    string Status,
    string? PrazoStatus,
    DateTimeOffset? IniciadoEm,
    DateTimeOffset? ConcluidoEm);
