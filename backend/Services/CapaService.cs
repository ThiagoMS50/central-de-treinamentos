using LmsApi.Dtos;
using LmsApi.Services.Supabase;

namespace LmsApi.Services;

// Imagem de capa de cursos e trilhas: validação, upload e remoção no bucket público "capas".
public class CapaService
{
    public const string Bucket = "capas";
    public const long TamanhoMaximoBytes = 5 * 1024 * 1024;
    // Ilustrações prontas, compartilhadas entre cursos/trilhas — nunca são apagadas ao trocar a capa.
    public const string PastaGaleria = "galeria";

    private static readonly Dictionary<string, string> ExtensaoPorTipo = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = "jpg",
        ["image/png"] = "png",
        ["image/webp"] = "webp",
    };

    private readonly ISupabaseStorageClient _storage;

    public CapaService(ISupabaseStorageClient storage)
    {
        _storage = storage;
    }

    public string? Url(string? capaPath) => string.IsNullOrEmpty(capaPath) ? null : _storage.GetPublicUrl(Bucket, capaPath);

    // Devolve a mensagem de erro para o usuário, ou null se o arquivo for aceito.
    public static string? Validar(IFormFile? arquivo)
    {
        if (arquivo is null || arquivo.Length == 0) return "Escolha uma imagem.";
        if (!ExtensaoPorTipo.ContainsKey(arquivo.ContentType)) return "Use uma imagem JPG, PNG ou WebP.";
        if (arquivo.Length > TamanhoMaximoBytes) return "A imagem pode ter no máximo 5 MB.";
        return null;
    }

    // pasta: "cursos" ou "trilhas". Cada envio gera um nome novo, então a URL muda junto com a
    // imagem e o navegador nunca mostra a capa antiga do cache.
    public async Task<string> EnviarAsync(string pasta, Guid id, IFormFile arquivo)
    {
        var caminho = $"{pasta}/{id}/{Guid.NewGuid()}.{ExtensaoPorTipo[arquivo.ContentType]}";
        await using var stream = arquivo.OpenReadStream();
        await _storage.UploadAsync(Bucket, caminho, stream, arquivo.ContentType);
        return caminho;
    }

    // Imagens disponíveis na galeria (nome do arquivo + URL pública).
    public async Task<List<CapaGaleriaDto>> ListarGaleriaAsync()
    {
        var nomes = await _storage.ListAsync(Bucket, PastaGaleria);
        return nomes
            .Where(n => ExtensaoPorTipo.Values.Any(ext => n.EndsWith("." + ext, StringComparison.OrdinalIgnoreCase)))
            .Select(n => new CapaGaleriaDto(n, _storage.GetPublicUrl(Bucket, $"{PastaGaleria}/{n}")))
            .ToList();
    }

    // Caminho da imagem da galeria, ou null se o nome não existir lá (evita apontar para qualquer
    // arquivo do bucket a partir de um nome enviado pelo cliente).
    public async Task<string?> CaminhoDaGaleriaAsync(string? nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) return null;
        var existe = (await _storage.ListAsync(Bucket, PastaGaleria)).Contains(nome);
        return existe ? $"{PastaGaleria}/{nome}" : null;
    }

    public async Task RemoverAsync(string? capaPath)
    {
        if (string.IsNullOrEmpty(capaPath)) return;
        if (capaPath.StartsWith(PastaGaleria + "/", StringComparison.Ordinal)) return;
        try { await _storage.DeleteAsync(Bucket, capaPath); }
        catch (SupabaseRestException) { /* melhor esforço — um arquivo órfão não quebra nada */ }
    }
}
