using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace LmsApi.Services.Supabase;

public class SupabaseRestClient : ISupabaseRestClient
{
    private readonly HttpClient _http;

    public SupabaseRestClient(HttpClient http)
    {
        _http = http;
    }

    private static string BuildUrl(string table, string? filter, string? select, string? order)
    {
        var query = new List<string>();
        if (!string.IsNullOrEmpty(select)) query.Add($"select={select}");
        if (!string.IsNullOrEmpty(filter)) query.Add(filter);
        if (!string.IsNullOrEmpty(order)) query.Add($"order={order}");
        return query.Count > 0 ? $"{table}?{string.Join("&", query)}" : table;
    }

    private static StringContent ToJsonContent(object payload)
    {
        var json = JsonSerializer.Serialize(payload, SupabaseJsonOptions.Options);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new SupabaseRestException((int)response.StatusCode, body);
        }
    }

    public async Task<List<T>> SelectAsync<T>(string table, string? filter = null, string? select = null, string? order = null)
    {
        var response = await _http.GetAsync(BuildUrl(table, filter, select, order));
        await EnsureSuccessAsync(response);
        var result = await response.Content.ReadFromJsonAsync<List<T>>(SupabaseJsonOptions.Options);
        return result ?? new List<T>();
    }

    public async Task<T?> GetByIdAsync<T>(string table, Guid id, string? select = null) where T : class
    {
        var rows = await SelectAsync<T>(table, PostgrestFilter.Eq("id", id), select);
        return rows.FirstOrDefault();
    }

    public async Task<T> InsertAsync<T>(string table, object payload)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, table) { Content = ToJsonContent(payload) };
        request.Headers.Add("Prefer", "return=representation");
        var response = await _http.SendAsync(request);
        await EnsureSuccessAsync(response);
        var result = await response.Content.ReadFromJsonAsync<List<T>>(SupabaseJsonOptions.Options);
        return result!.First();
    }

    public async Task<List<T>> InsertManyAsync<T>(string table, IEnumerable<object> payloads)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, table) { Content = ToJsonContent(payloads) };
        request.Headers.Add("Prefer", "return=representation");
        var response = await _http.SendAsync(request);
        await EnsureSuccessAsync(response);
        var result = await response.Content.ReadFromJsonAsync<List<T>>(SupabaseJsonOptions.Options);
        return result ?? new List<T>();
    }

    public async Task<T> UpsertAsync<T>(string table, object payload, string onConflictColumns)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"{table}?on_conflict={onConflictColumns}")
        {
            Content = ToJsonContent(payload)
        };
        request.Headers.Add("Prefer", "resolution=merge-duplicates,return=representation");
        var response = await _http.SendAsync(request);
        await EnsureSuccessAsync(response);
        var result = await response.Content.ReadFromJsonAsync<List<T>>(SupabaseJsonOptions.Options);
        return result!.First();
    }

    public async Task<T?> UpdateAsync<T>(string table, string filter, object patch) where T : class
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, $"{table}?{filter}") { Content = ToJsonContent(patch) };
        request.Headers.Add("Prefer", "return=representation");
        var response = await _http.SendAsync(request);
        await EnsureSuccessAsync(response);
        var result = await response.Content.ReadFromJsonAsync<List<T>>(SupabaseJsonOptions.Options);
        return result?.FirstOrDefault();
    }

    public async Task DeleteAsync(string table, string filter)
    {
        var response = await _http.DeleteAsync($"{table}?{filter}");
        await EnsureSuccessAsync(response);
    }

    public async Task<int> CountAsync(string table, string? filter = null)
    {
        var url = string.IsNullOrEmpty(filter) ? table : $"{table}?{filter}";
        var request = new HttpRequestMessage(HttpMethod.Head, url);
        request.Headers.Add("Prefer", "count=exact");
        var response = await _http.SendAsync(request);
        await EnsureSuccessAsync(response);

        string? contentRange = null;
        if (response.Content.Headers.TryGetValues("Content-Range", out var contentValues))
            contentRange = contentValues.FirstOrDefault();
        else if (response.Headers.TryGetValues("Content-Range", out var headerValues))
            contentRange = headerValues.FirstOrDefault();

        if (string.IsNullOrEmpty(contentRange)) return 0;
        var slashIndex = contentRange.IndexOf('/');
        if (slashIndex < 0 || slashIndex == contentRange.Length - 1) return 0;
        return int.TryParse(contentRange[(slashIndex + 1)..], out var total) ? total : 0;
    }
}
