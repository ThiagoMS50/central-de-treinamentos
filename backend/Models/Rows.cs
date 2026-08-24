namespace LmsApi.Models;

// Estas classes espelham as colunas das tabelas do Postgres (supabase/schema.sql) em snake_case.
// A serialização usa SupabaseJsonOptions (PropertyNamingPolicy = SnakeCaseLower) só para conversar
// com a API REST do Supabase — nada disso é exposto diretamente ao frontend (ver pasta Dtos/).

public class ProfileRow
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "aluno";
    public Guid? ManagerId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class TrilhaRow
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CursoRow
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal CargaHorariaHoras { get; set; }
    public bool TemPrazo { get; set; }
    public int? PrazoDias { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CursoTrilhaRow
{
    public Guid CursoId { get; set; }
    public Guid TrilhaId { get; set; }
    public int Ordem { get; set; }
}

public class MaterialRow
{
    public Guid Id { get; set; }
    public Guid CursoId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public int Ordem { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class QuizRow
{
    public Guid Id { get; set; }
    public Guid CursoId { get; set; }
    public string Titulo { get; set; } = "Quiz de prática";
}

public class PerguntaRow
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string Enunciado { get; set; } = string.Empty;
    public int Ordem { get; set; }
}

public class AlternativaRow
{
    public Guid Id { get; set; }
    public Guid PerguntaId { get; set; }
    public string Texto { get; set; } = string.Empty;
    public bool Correta { get; set; }
    public int Ordem { get; set; }
}

public class MatriculaRow
{
    public Guid Id { get; set; }
    public Guid AlunoId { get; set; }
    public Guid CursoId { get; set; }
    public DateTimeOffset IniciadoEm { get; set; }
    public DateTimeOffset? ConcluidoEm { get; set; }
}

public class RespostaQuizRow
{
    public Guid Id { get; set; }
    public Guid AlunoId { get; set; }
    public Guid PerguntaId { get; set; }
    public Guid AlternativaId { get; set; }
    public DateTimeOffset RespondidoEm { get; set; }
}

public class CertificadoRow
{
    public Guid Id { get; set; }
    public Guid AlunoId { get; set; }
    public Guid? CursoId { get; set; }
    public Guid? TrilhaId { get; set; }
    public string CodigoValidacao { get; set; } = string.Empty;
    public DateTimeOffset EmitidoEm { get; set; }
}
