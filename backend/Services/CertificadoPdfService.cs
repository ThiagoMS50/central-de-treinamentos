using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;

namespace LmsApi.Services;

public class CertificadoPdfModel
{
    public string NomeAluno { get; set; } = string.Empty;
    public bool EhTrilha { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public decimal? CargaHorariaHoras { get; set; }
    public DateTimeOffset DataConclusao { get; set; }
    public string CodigoValidacao { get; set; } = string.Empty;
}

// Gera o PDF do certificado na hora, a cada download (não fica salvo em disco/Storage) —
// mais simples para o tamanho do MVP. Cores e logo seguem a identidade visual da PEEX Brasil.
public class CertificadoPdfService
{
    private static readonly XColor CorPrimaria = XColor.FromArgb(0xC2, 0x46, 0x9B); // rosa/magenta da marca
    private static readonly XColor CorSecundaria = XColor.FromArgb(0xD8, 0x67, 0x4A); // laranja da marca
    private static readonly XColor CorTextoMuted = XColor.FromArgb(0x64, 0x64, 0x64);

    private static readonly string LogoPath = Path.Combine(AppContext.BaseDirectory, "Assets", "peex-logo.png");

    public byte[] Gerar(CertificadoPdfModel model)
    {
        using var document = new PdfDocument();
        var page = document.AddPage();
        page.Orientation = PdfSharpCore.PageOrientation.Landscape;
        page.Size = PdfSharpCore.PageSize.A4;

        var width = page.Width.Point;
        var height = page.Height.Point;

        using var gfx = XGraphics.FromPdfPage(page);

        var bordaExterna = new XPen(CorPrimaria, 3);
        gfx.DrawRectangle(bordaExterna, 20, 20, width - 40, height - 40);
        var bordaInterna = new XPen(CorSecundaria, 1);
        gfx.DrawRectangle(bordaInterna, 28, 28, width - 56, height - 56);

        var titleFont = new XFont("Arial", 28, XFontStyle.Bold);
        var subtitleFont = new XFont("Arial", 12, XFontStyle.Regular);
        var bodyFont = new XFont("Arial", 15, XFontStyle.Regular);
        var nameFont = new XFont("Arial", 22, XFontStyle.BoldItalic);
        var footerFont = new XFont("Arial", 10, XFontStyle.Regular);

        var center = new XStringFormat { Alignment = XStringAlignment.Center, LineAlignment = XLineAlignment.Center };
        var left = new XStringFormat { Alignment = XStringAlignment.Near, LineAlignment = XLineAlignment.Near };

        if (File.Exists(LogoPath))
        {
            using var logo = XImage.FromFile(LogoPath);
            var logoWidth = 130.0;
            var logoHeight = logoWidth * logo.PixelHeight / logo.PixelWidth;
            gfx.DrawImage(logo, (width - logoWidth) / 2, 40, logoWidth, logoHeight);
        }

        gfx.DrawString("Certificado de Conclusão", titleFont, new XSolidBrush(CorPrimaria), new XRect(0, 110, width, 45), center);

        gfx.DrawString("Certificamos que", bodyFont, XBrushes.Black, new XRect(0, 168, width, 25), center);
        gfx.DrawString(model.NomeAluno, nameFont, new XSolidBrush(CorSecundaria), new XRect(0, 196, width, 32), center);

        var cargaHorariaTexto = model.CargaHorariaHoras is > 0
            ? $", com carga horária de {model.CargaHorariaHoras.Value:0.#} horas,"
            : string.Empty;
        var tipoTexto = model.EhTrilha ? "a trilha" : "o curso";
        var corpo = $"concluiu {tipoTexto} \"{model.Titulo}\"{cargaHorariaTexto} em {model.DataConclusao:dd/MM/yyyy}.";
        gfx.DrawString(corpo, bodyFont, XBrushes.Black, new XRect(70, 233, width - 140, 60), center);

        var linhaRodape = new XPen(CorPrimaria, 1);
        gfx.DrawLine(linhaRodape, 45, height - 70, width - 45, height - 70);

        gfx.DrawString($"Código de validação: {model.CodigoValidacao}", footerFont, new XSolidBrush(CorTextoMuted),
            new XRect(45, height - 58, width - 90, 20), left);
        gfx.DrawString("Central de Treinamentos — PEEX Brasil", subtitleFont, new XSolidBrush(CorTextoMuted),
            new XRect(0, height - 58, width - 45, 20), new XStringFormat { Alignment = XStringAlignment.Far });

        using var stream = new MemoryStream();
        document.Save(stream, false);
        return stream.ToArray();
    }
}
