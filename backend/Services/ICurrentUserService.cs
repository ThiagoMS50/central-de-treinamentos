namespace LmsApi.Services;

// Dados do usuário autenticado da requisição atual, já resolvidos pelas claims
// (populadas por LmsApi.Auth.SupabaseClaimsTransformation) — sem round-trip extra ao Supabase.
public interface ICurrentUserService
{
    Guid UserId { get; }
    string Email { get; }
    string? Nome { get; }
    string? Role { get; }
    Guid? ManagerId { get; }
    bool HasProfile { get; }
    bool IsAdmin { get; }
    bool IsGestor { get; }
}
