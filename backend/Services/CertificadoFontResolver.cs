using PdfSharpCore.Fonts;

namespace LmsApi.Services;

// PdfSharpCore só consegue usar fontes do sistema operacional (GDI) no Windows. Em produção
// (container Linux, no Render) não existe nenhuma fonte instalada, então gerar qualquer PDF sem
// um IFontResolver explícito falha com 500 — mesmo funcionando normalmente no Windows do
// desenvolvedor. Por isso embarcamos a Liberation Sans (SIL Open Font License, compatível em
// métrica com a Arial) em Assets/Fonts, para não depender do que estiver instalado no container.
public class CertificadoFontResolver : IFontResolver
{
    private static readonly string FontsDir = Path.Combine(AppContext.BaseDirectory, "Assets", "Fonts");

    public string DefaultFontName => "LiberationSans-Regular";

    public byte[] GetFont(string faceName) => File.ReadAllBytes(Path.Combine(FontsDir, $"{faceName}.ttf"));

    public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic)
    {
        var faceName = (isBold, isItalic) switch
        {
            (true, true) => "LiberationSans-BoldItalic",
            (true, false) => "LiberationSans-Bold",
            (false, true) => "LiberationSans-Italic",
            (false, false) => "LiberationSans-Regular",
        };
        return new FontResolverInfo(faceName);
    }
}
