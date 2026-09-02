using LmsApi.Dtos;
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

    // Compartilhado com CursosController — mesma regra usada tanto para "meu progresso"
    // quanto para o acompanhamento de um aluno pela Administração/Gestor.
    public static (string status, string? prazoStatus, DateTimeOffset? prazoEm) CalcularStatus(CursoRow curso, MatriculaRow? matricula)
    {
        if (matricula is null) return ("nao_iniciado", null, null);
        if (matricula.ConcluidoEm.HasValue) return ("concluido", null, null);

        if (!curso.TemPrazo || curso.PrazoDias is null) return ("em_andamento", null, null);

        var prazoEm = matricula.IniciadoEm.AddDays(curso.PrazoDias.Value);
        var prazoStatus = DateTimeOffset.UtcNow > prazoEm ? "atrasado" : "em_dia";
        return ("em_andamento", prazoStatus, prazoEm);
    }

    // Status de TODOS os cursos para um aluno específico — usado no acompanhamento de progresso
    // (Administração/Gestor), diferente do "meus pontos" que só lista o que já foi concluído.
    public async Task<List<ProgressoCursoDto>> ObterProgressoDeAlunoAsync(Guid alunoId)
    {
        var cursos = await _rest.SelectAsync<CursoRow>("cursos", order: "created_at.asc");
        var matriculas = await _rest.SelectAsync<MatriculaRow>("matriculas", PostgrestFilter.Eq("aluno_id", alunoId));
        var matriculasPorCurso = matriculas.ToDictionary(m => m.CursoId);

        return cursos.Select(curso =>
        {
            var matricula = matriculasPorCurso.GetValueOrDefault(curso.Id);
            var (status, prazoStatus, prazoEm) = CalcularStatus(curso, matricula);
            return new ProgressoCursoDto(curso.Id, curso.Titulo, status, prazoStatus, matricula?.IniciadoEm, matricula?.ConcluidoEm);
        }).ToList();
    }

    // Só consulta, nunca cria — usado quando o Admin abre um curso pra revisar conteúdo, pra não
    // gerar uma "matrícula" falsa dele (ele não é aluno daquele curso, só está gerenciando).
    public async Task<MatriculaRow?> GetMatriculaAsync(Guid alunoId, Guid cursoId)
    {
        var existentes = await _rest.SelectAsync<MatriculaRow>(
            "matriculas",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", alunoId), PostgrestFilter.Eq("curso_id", cursoId)));
        return existentes.FirstOrDefault();
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

    // Lista as aulas de um curso já com o status de conclusão do aluno informado e os materiais
    // de cada uma — usada tanto no detalhe do curso (aluno) quanto no formulário de edição (admin).
    public async Task<List<AulaDto>> ObterAulasComProgressoAsync(Guid cursoId, Guid alunoId)
    {
        var aulas = await _rest.SelectAsync<AulaRow>("aulas", PostgrestFilter.Eq("curso_id", cursoId), order: "ordem.asc");
        if (aulas.Count == 0) return new List<AulaDto>();

        var aulaIds = aulas.Select(a => a.Id).Cast<object>().ToList();
        var materiais = await _rest.SelectAsync<MaterialRow>("materiais", PostgrestFilter.In("aula_id", aulaIds), order: "ordem.asc");
        var materiaisPorAula = materiais.GroupBy(m => m.AulaId).ToDictionary(g => g.Key, g => g.ToList());

        var progresso = await _rest.SelectAsync<AulaProgressoRow>(
            "aula_progresso",
            PostgrestFilter.And(PostgrestFilter.Eq("aluno_id", alunoId), PostgrestFilter.In("aula_id", aulaIds)));
        var concluidasIds = progresso.Select(p => p.AulaId).ToHashSet();

        return aulas.Select(a => new AulaDto(
            a.Id,
            a.Titulo,
            a.Ordem,
            concluidasIds.Contains(a.Id),
            (materiaisPorAula.GetValueOrDefault(a.Id) ?? new List<MaterialRow>())
                .Select(m => new MaterialDto(m.Id, m.Titulo, m.Ordem)).ToList())).ToList();
    }

    // Marca uma aula como concluída pelo aluno; quando essa era a última aula pendente do curso,
    // o curso inteiro é considerado concluído (matrícula, pontos/badges e trilhas em cadeia) —
    // substitui o antigo botão único de "concluir curso".
    public async Task<ConcluirAulaResponse> MarcarAulaConcluidaAsync(Guid alunoId, Guid aulaId)
    {
        var aula = await _rest.GetByIdAsync<AulaRow>("aulas", aulaId);
        if (aula is null) throw new KeyNotFoundException("Aula não encontrada.");

        await GetOrCreateMatriculaAsync(alunoId, aula.CursoId);

        await _rest.UpsertAsync<AulaProgressoRow>(
            "aula_progresso",
            new { aluno_id = alunoId, aula_id = aulaId },
            "aluno_id,aula_id");

        var todasAulas = await _rest.SelectAsync<AulaRow>("aulas", PostgrestFilter.Eq("curso_id", aula.CursoId));
        var progresso = await _rest.SelectAsync<AulaProgressoRow>("aula_progresso", PostgrestFilter.Eq("aluno_id", alunoId));
        var concluidasIds = progresso.Select(p => p.AulaId).ToHashSet();

        var todasConcluidas = todasAulas.Count > 0 && todasAulas.All(a => concluidasIds.Contains(a.Id));
        if (!todasConcluidas) return new ConcluirAulaResponse(false, new List<Guid>());

        var matricula = await GetMatriculaAsync(alunoId, aula.CursoId);
        if (matricula?.ConcluidoEm is not null) return new ConcluirAulaResponse(true, new List<Guid>());

        var trilhasCompletas = await ConcluirCursoInternoAsync(alunoId, aula.CursoId);
        return new ConcluirAulaResponse(true, trilhasCompletas);
    }

    private async Task<List<Guid>> ConcluirCursoInternoAsync(Guid alunoId, Guid cursoId)
    {
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
