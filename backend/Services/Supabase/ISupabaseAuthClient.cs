namespace LmsApi.Services.Supabase;

public interface ISupabaseAuthClient
{
    Task SendPasswordRecoveryAsync(string email, string redirectTo);
}
