namespace LmsApi.Services.Supabase;

public interface ISupabaseStorageClient
{
    Task<string> UploadAsync(string bucket, string path, Stream content, string contentType);
    Task<string> CreateSignedUrlAsync(string bucket, string path, int expiresInSeconds);
    Task DeleteAsync(string bucket, string path);
}
