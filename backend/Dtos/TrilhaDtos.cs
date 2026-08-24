namespace LmsApi.Dtos;

public record TrilhaListItemDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    int TotalCursos,
    int CursosConcluidos,
    double ProgressoPercentual,
    bool Completa);

public record TrilhaCursoDto(Guid CursoId, string Titulo, int Ordem, string Status);

public record TrilhaDetailDto(
    Guid Id,
    string Titulo,
    string? Descricao,
    int TotalCursos,
    int CursosConcluidos,
    double ProgressoPercentual,
    bool Completa,
    List<TrilhaCursoDto> Cursos);

public record CreateOrUpdateTrilhaRequest(string Titulo, string? Descricao);

public record TrilhaCursoOrdemItem(Guid CursoId, int Ordem);

public record SetTrilhaCursosRequest(List<TrilhaCursoOrdemItem> Cursos);
