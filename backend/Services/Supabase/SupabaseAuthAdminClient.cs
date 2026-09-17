namespace LmsApi.Services.Supabase;

// Fala com a Admin API do GoTrue (Supabase Auth) usando a service_role key — só o backend acessa,
// nunca o frontend. Excluir o usuário aqui cascateia automaticamente pra profiles e tudo que
// referencia profiles.id (matriculas, aula_progresso, respostas_quiz, pontos_eventos,
// aluno_badges, certificados), graças ao "on delete cascade" já definido no schema.
public class SupabaseAuthAdminClient : ISupabaseAuthAdminClient
{
    private readonly HttpClient _http;

    public SupabaseAuthAdminClient(HttpClient http)
    {
        _http = http;
    }

    public async Task DeleteUserAsync(Guid userId)
    {
        var response = await _http.DeleteAsync($"users/{userId}");
        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new SupabaseRestException((int)response.StatusCode, body);
        }
    }
}
