namespace LmsApi.Services.Supabase;

public interface ISupabaseStorageClient
{
    Task<string> UploadAsync(string bucket, string path, Stream content, string contentType);
    Task<string> CreateSignedUrlAsync(string bucket, string path, int expiresInSeconds);
    Task DeleteAsync(string bucket, string path);
    // URL fixa de um arquivo num bucket público (não faz chamada HTTP).
    string GetPublicUrl(string bucket, string path);
}
