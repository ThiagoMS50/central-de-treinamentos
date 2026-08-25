using System.Net.Http.Json;

namespace LmsApi.Services.Supabase;

// Fala com o endpoint público /auth/v1/recover do GoTrue (Supabase Auth) — o mesmo que
// supabase-js chama em resetPasswordForEmail. É chamado pelo backend (em vez do frontend)
// porque antes de disparar o e-mail precisamos checar se o cadastro existe na tabela profiles.
public class SupabaseAuthClient : ISupabaseAuthClient
{
    private readonly HttpClient _http;

    public SupabaseAuthClient(HttpClient http)
    {
        _http = http;
    }

    public async Task SendPasswordRecoveryAsync(string email, string redirectTo)
    {
        var url = $"recover?redirect_to={Uri.EscapeDataString(redirectTo)}";
        var response = await _http.PostAsJsonAsync(url, new { email });
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new SupabaseRestException((int)response.StatusCode, body);
        }
    }
}
