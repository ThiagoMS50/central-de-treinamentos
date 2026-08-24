using System.Text;
using System.Text.Json;
using LmsApi;
using Microsoft.Extensions.Options;

namespace LmsApi.Services.Supabase;

public class SupabaseStorageClient : ISupabaseStorageClient
{
    private readonly HttpClient _http;
    private readonly string _supabaseUrl;

    public SupabaseStorageClient(HttpClient http, IOptions<SupabaseOptions> options)
    {
        _http = http;
        _supabaseUrl = options.Value.Url.TrimEnd('/');
    }

    public async Task<string> UploadAsync(string bucket, string path, Stream content, string contentType)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"object/{bucket}/{path}")
        {
            Content = new StreamContent(content)
        };
        request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
        request.Headers.Add("x-upsert", "true");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new SupabaseRestException((int)response.StatusCode, body);
        }

        return path;
    }

    public async Task<string> CreateSignedUrlAsync(string bucket, string path, int expiresInSeconds)
    {
        var payload = JsonSerializer.Serialize(new { expiresIn = expiresInSeconds });
        var request = new HttpRequestMessage(HttpMethod.Post, $"object/sign/{bucket}/{path}")
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };

        var response = await _http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            throw new SupabaseRestException((int)response.StatusCode, body);
        }

        using var doc = JsonDocument.Parse(body);
        var signedPath = doc.RootElement.GetProperty("signedURL").GetString()
            ?? throw new InvalidOperationException("Supabase Storage não retornou signedURL.");

        return $"{_supabaseUrl}/storage/v1{signedPath}";
    }

    public async Task DeleteAsync(string bucket, string path)
    {
        var response = await _http.DeleteAsync($"object/{bucket}/{path}");
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new SupabaseRestException((int)response.StatusCode, body);
        }
    }
}
