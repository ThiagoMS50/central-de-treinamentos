using LmsApi.Models;
using LmsApi.Services.Supabase;

namespace LmsApi.Services;

// Regras de matrícula/progresso: cria a matrícula automaticamente no primeiro acesso a um curso,
// marca conclusão, e verifica se isso completa alguma trilha que contém o curso.
public class ProgressoService
{
    private readonly ISupabaseRestClient _rest;
    private readonly GamificacaoService _gamificacao;

    public ProgressoService(ISupabaseRestClient rest, GamificacaoService gamificacao)
    {
        _rest = rest;
        _gamificacao = gamificacao;
    }

    public async Task<MatriculaRow> GetOrCreateMatriculaAsync(Guid alunoId, Guid cursoId)
    {
        var existentes = await _rest.SelectAsync<MatriculaRow>(
            "matriculas",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", alunoId), PostgrestFilter.Eq("curso_id", cursoId)));

        var encontrada = existentes.FirstOrDefault();
        if (encontrada is not null) return encontrada;

        return await _rest.UpsertAsync<MatriculaRow>(
            "matriculas",
            new { aluno_id = alunoId, curso_id = cursoId },
            "aluno_id,curso_id");
    }

    public async Task<List<Guid>> MarcarConcluidoAsync(Guid alunoId, Guid cursoId)
    {
        await GetOrCreateMatriculaAsync(alunoId, cursoId);

        await _rest.UpdateAsync<MatriculaRow>(
            "matriculas",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", alunoId), PostgrestFilter.Eq("curso_id", cursoId)),
            new { concluido_em = DateTimeOffset.UtcNow });

        await _gamificacao.RegistrarConclusaoCursoAsync(alunoId, cursoId);

        var vinculosDoCurso = await _rest.SelectAsync<CursoTrilhaRow>("curso_trilhas", PostgrestFilter.Eq("curso_id", cursoId));
        var trilhasCompletas = new List<Guid>();

        foreach (var vinculo in vinculosDoCurso)
        {
            if (await TrilhaEstaCompletaAsync(alunoId, vinculo.TrilhaId))
            {
                trilhasCompletas.Add(vinculo.TrilhaId);
                await _gamificacao.RegistrarConclusaoTrilhaAsync(alunoId, vinculo.TrilhaId);
            }
        }

        return trilhasCompletas;
    }

    public async Task<bool> TrilhaEstaCompletaAsync(Guid alunoId, Guid trilhaId)
    {
        var cursosDaTrilha = await _rest.SelectAsync<CursoTrilhaRow>("curso_trilhas", PostgrestFilter.Eq("trilha_id", trilhaId));
        if (cursosDaTrilha.Count == 0) return false;

        var cursoIds = cursosDaTrilha.Select(c => c.CursoId).ToList();
        var matriculas = await _rest.SelectAsync<MatriculaRow>(
            "matriculas",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", alunoId), PostgrestFilter.In("curso_id", cursoIds.Cast<object>())));

        return cursoIds.All(id => matriculas.Any(m => m.CursoId == id && m.ConcluidoEm.HasValue));
    }
}
