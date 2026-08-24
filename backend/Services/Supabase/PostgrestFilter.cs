namespace LmsApi.Services.Supabase;

// Helpers pequenos para montar os filtros de querystring que o PostgREST (API REST do Supabase) entende.
public static class PostgrestFilter
{
    public static string Eq(string column, object value) => $"{column}=eq.{Uri.EscapeDataString(value.ToString() ?? string.Empty)}";

    public static string In(string column, IEnumerable<object> values)
    {
        var joined = string.Join(",", values.Select(v => Uri.EscapeDataString(v.ToString() ?? string.Empty)));
        return $"{column}=in.({joined})";
    }

    public static string Gte(string column, object value) => $"{column}=gte.{Uri.EscapeDataString(value.ToString() ?? string.Empty)}";

    public static string Lte(string column, object value) => $"{column}=lte.{Uri.EscapeDataString(value.ToString() ?? string.Empty)}";

    public static string And(params string?[] filters) =>
        string.Join("&", filters.Where(f => !string.IsNullOrWhiteSpace(f)));
}
