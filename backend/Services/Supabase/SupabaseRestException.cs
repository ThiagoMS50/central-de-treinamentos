namespace LmsApi.Services.Supabase;

public class SupabaseRestException : Exception
{
    public int StatusCode { get; }
    public string Body { get; }

    public SupabaseRestException(int statusCode, string body)
        : base($"Supabase REST retornou {statusCode}: {body}")
    {
        StatusCode = statusCode;
        Body = body;
    }
}
