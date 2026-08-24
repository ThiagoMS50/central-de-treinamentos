namespace LmsApi.Dtos;

public record CursoConclusaoDto(Guid CursoId, string Titulo, int TotalMatriculados, int Concluidos, double TaxaConclusao);

public record PendenciaDto(Guid AlunoId, string AlunoNome, Guid CursoId, string CursoTitulo, DateTimeOffset PrazoEm);

public record EquipeProgressoDto(Guid GestorId, string GestorNome, int TotalAlunos, double ProgressoMedioPercentual);

public record RelatorioDashboardDto(
    double TaxaConclusaoGeral,
    double TempoMedioConclusaoDias,
    double NotaMediaQuizPercentual,
    List<CursoConclusaoDto> ConclusaoPorCurso,
    List<PendenciaDto> Atrasados,
    List<EquipeProgressoDto> ProgressoPorEquipe);
