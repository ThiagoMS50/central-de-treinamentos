using System.Text.Json;

namespace LmsApi.Services.Supabase;

// Serialização usada só para conversar com a API REST do Supabase (colunas em snake_case).
// Independente da configuração de JSON da própria API MVC (que usa camelCase pro frontend).
//
// Importante: NÃO ignoramos propriedades null aqui de propósito — os payloads de insert/update
// são sempre objetos anônimos pequenos montados à mão nos controllers (nunca as classes Row
// inteiras), então um valor null explícito (ex: "limpar" manager_id) precisa mesmo ser enviado
// como `null` no JSON, e não omitido (omitir faria o PATCH simplesmente não tocar na coluna).
public static class SupabaseJsonOptions
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };
}
