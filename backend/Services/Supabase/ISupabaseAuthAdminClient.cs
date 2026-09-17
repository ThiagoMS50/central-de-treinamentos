namespace LmsApi.Services.Supabase;

public interface ISupabaseAuthAdminClient
{
    Task DeleteUserAsync(Guid userId);
}
