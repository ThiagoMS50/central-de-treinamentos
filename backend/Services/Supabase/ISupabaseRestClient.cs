namespace LmsApi.Services.Supabase;

// Cliente fino sobre a API REST (PostgREST) do Supabase. Sempre usa a service_role key
// (configurada no HttpClient em Program.cs), então tem acesso total às tabelas — a autorização
// por papel é responsabilidade do backend (controllers), não do Supabase, já que o RLS nega tudo
// exceto para essa chave.
public interface ISupabaseRestClient
{
    Task<List<T>> SelectAsync<T>(string table, string? filter = null, string? select = null, string? order = null);
    Task<T?> GetByIdAsync<T>(string table, Guid id, string? select = null) where T : class;
    Task<T> InsertAsync<T>(string table, object payload);
    Task<List<T>> InsertManyAsync<T>(string table, IEnumerable<object> payloads);
    Task<T> UpsertAsync<T>(string table, object payload, string onConflictColumns);
    Task<T?> UpdateAsync<T>(string table, string filter, object patch) where T : class;
    Task DeleteAsync(string table, string filter);
    Task<int> CountAsync(string table, string? filter = null);
}
