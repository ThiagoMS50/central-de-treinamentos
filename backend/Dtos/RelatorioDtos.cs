namespace LmsApi.Dtos;

public record RelatorioDashboardDto(
    double TaxaConclusaoGeral,
    double TempoMedioConclusaoDias,
    double NotaMediaQuizPercentual);

// Resumo por aluno (não afetado pelos filtros de curso/período do dashboard — é sempre a foto
// completa da pessoa) usado na tabela "Colaboradores" dos Relatórios, com drill-down por pop-up.
public record AlunoResumoDto(Guid AlunoId, string Nome, int TotalCursos, int CursosConcluidos, double ProgressoPercentual);
