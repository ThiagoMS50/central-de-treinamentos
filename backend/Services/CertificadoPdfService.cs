using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using QRCoder;

namespace LmsApi.Services;

public class CertificadoPdfModel
{
    public string NomeAluno { get; set; } = string.Empty;
    public bool EhTrilha { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public decimal? CargaHorariaHoras { get; set; }
    public DateTimeOffset DataConclusao { get; set; }
    public string CodigoValidacao { get; set; } = string.Empty;
    // Endereço da página pública de validação (vira QR code). Null = sem QR, só o código.
    public string? UrlValidacao { get; set; }
}

// Gera o PDF do certificado na hora, a cada download (não fica salvo em disco/Storage).
// Visual no padrão da plataforma: faixa lateral no degradê da marca com o selo, fonte Plus
// Jakarta Sans (a mesma da interface), nome em destaque, cartões de informação e um QR code
// que leva à página pública de validação.
public class CertificadoPdfService
{
    private static readonly XColor Rosa = XColor.FromArgb(0xC8, 0x4F, 0xA8);
    private static readonly XColor Laranja = XColor.FromArgb(0xE2, 0x73, 0x4F);
    private static readonly XColor RosaTexto = XColor.FromArgb(0xC2, 0x38, 0x7A);
    private static readonly XColor Texto = XColor.FromArgb(0x17, 0x14, 0x1F);
    private static readonly XColor TextoSuave = XColor.FromArgb(0x6B, 0x65, 0x78);
    private static readonly XColor Superficie = XColor.FromArgb(0xF6, 0xF5, 0xF8);
    private static readonly XColor Borda = XColor.FromArgb(0xE7, 0xE3, 0xEE);

    private static readonly string LogoPath = Path.Combine(AppContext.BaseDirectory, "Assets", "peex-logo.png");

    // Nomes dos meses fixos em português: o container de produção pode não ter dados de cultura.
    private static readonly string[] Meses =
    {
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    };

    private const double LarguraFaixa = 250;
    private const double MargemConteudo = 300; // x onde começa o conteúdo à direita da faixa
    private const double MargemDireita = 50;

    public byte[] Gerar(CertificadoPdfModel model)
    {
        using var document = new PdfDocument();
        document.Info.Title = $"Certificado — {model.Titulo}";
        var page = document.AddPage();
        page.Orientation = PdfSharpCore.PageOrientation.Landscape;
        page.Size = PdfSharpCore.PageSize.A4;

        var largura = page.Width.Point;
        var altura = page.Height.Point;
        var larguraConteudo = largura - MargemConteudo - MargemDireita;

        using var gfx = XGraphics.FromPdfPage(page);

        DesenharFaixa(gfx, altura, model.EhTrilha);

        // ---------- Topo: logo + tipo ----------
        if (File.Exists(LogoPath))
        {
            using var logo = XImage.FromFile(LogoPath);
            const double logoLargura = 104;
            var logoAltura = logoLargura * logo.PixelHeight / logo.PixelWidth;
            gfx.DrawImage(logo, MargemConteudo - 6, 34, logoLargura, logoAltura);
        }
        DesenharEtiqueta(gfx, model.EhTrilha ? "TRILHA DE APRENDIZAGEM" : "CURSO", largura - MargemDireita, 52);

        // ---------- Nome ----------
        var y = 162.0;
        gfx.DrawString("CERTIFICAMOS QUE", new XFont("Jakarta SemiBold", 10), new XSolidBrush(TextoSuave),
            new XPoint(MargemConteudo, y), XStringFormats.TopLeft);
        y += 20;

        // Fonte do nome encolhe para caber numa linha; nomes muito longos (que não cabem nem em
        // 22pt) quebram em até duas linhas nesse tamanho.
        var tamanhoNome = 34.0;
        var fonteNome = new XFont("Jakarta ExtraBold", tamanhoNome);
        while (gfx.MeasureString(model.NomeAluno, fonteNome).Width > larguraConteudo && tamanhoNome > 22)
        {
            tamanhoNome -= 1;
            fonteNome = new XFont("Jakarta ExtraBold", tamanhoNome);
        }
        foreach (var linha in QuebrarLinhas(gfx, model.NomeAluno, fonteNome, larguraConteudo, maxLinhas: 2))
        {
            gfx.DrawString(linha, fonteNome, new XSolidBrush(Texto), new XPoint(MargemConteudo, y), XStringFormats.TopLeft);
            y += tamanhoNome * 1.25;
        }
        y += 8;

        DegradeHorizontal(gfx, MargemConteudo, y, 90, 5);
        y += 26;

        // ---------- Curso/trilha ----------
        // Mesmo estilo do "CERTIFICAMOS QUE": as duas frases de ligação formam um par visual.
        gfx.DrawString(model.EhTrilha ? "CONCLUIU COM ÊXITO A TRILHA DE APRENDIZAGEM" : "CONCLUIU COM ÊXITO O CURSO",
            new XFont("Jakarta SemiBold", 10), new XSolidBrush(TextoSuave), new XPoint(MargemConteudo, y), XStringFormats.TopLeft);
        y += 20;

        var fonteTitulo = new XFont("Jakarta SemiBold", 21);
        var linhasTitulo = QuebrarLinhas(gfx, model.Titulo, fonteTitulo, larguraConteudo, maxLinhas: 2);
        foreach (var linha in linhasTitulo)
        {
            gfx.DrawString(linha, fonteTitulo, new XSolidBrush(RosaTexto), new XPoint(MargemConteudo, y), XStringFormats.TopLeft);
            y += 27;
        }
        y += 24;

        // ---------- Cartões de informação ----------
        var cartoes = new List<(string Rotulo, string Valor)>();
        if (model.CargaHorariaHoras is > 0)
            cartoes.Add(("CARGA HORÁRIA", $"{model.CargaHorariaHoras.Value:0.#} {(model.CargaHorariaHoras.Value == 1 ? "hora" : "horas")}"));
        cartoes.Add(("CONCLUÍDO EM", DataPorExtenso(model.DataConclusao)));
        cartoes.Add(("EMITIDO POR", "Central de Treinamentos"));

        const double espaco = 12;
        var larguraCartao = (larguraConteudo - espaco * (cartoes.Count - 1)) / cartoes.Count;
        for (var i = 0; i < cartoes.Count; i++)
        {
            var x = MargemConteudo + i * (larguraCartao + espaco);
            gfx.DrawRoundedRectangle(new XPen(Borda, 1), new XSolidBrush(Superficie), x, y, larguraCartao, 56, 12, 12);
            gfx.DrawString(cartoes[i].Rotulo, new XFont("Jakarta SemiBold", 7.5), new XSolidBrush(TextoSuave),
                new XPoint(x + 14, y + 13), XStringFormats.TopLeft);
            gfx.DrawString(cartoes[i].Valor, new XFont("Jakarta", 12, XFontStyle.Bold), new XSolidBrush(Texto),
                new XPoint(x + 14, y + 29), XStringFormats.TopLeft);
        }

        // ---------- Rodapé: assinatura + validação ----------
        var yRodape = altura - 112;
        gfx.DrawLine(new XPen(Borda, 1), MargemConteudo, yRodape, largura - MargemDireita, yRodape);

        gfx.DrawString("Central de Treinamentos", new XFont("Jakarta", 12, XFontStyle.Bold), new XSolidBrush(Texto),
            new XPoint(MargemConteudo, yRodape + 22), XStringFormats.TopLeft);
        gfx.DrawString("PEEX Brasil · certificado emitido automaticamente pela plataforma", new XFont("Jakarta", 9),
            new XSolidBrush(TextoSuave), new XPoint(MargemConteudo, yRodape + 40), XStringFormats.TopLeft);

        DesenharValidacao(gfx, model, largura - MargemDireita, yRodape + 14);

        using var stream = new MemoryStream();
        document.Save(stream, false);
        return stream.ToArray();
    }

    // Faixa lateral no degradê da marca: losangos decorativos, selo central e a palavra CERTIFICADO.
    private static void DesenharFaixa(XGraphics gfx, double altura, bool ehTrilha)
    {
        DegradeVertical(gfx, 0, 0, LarguraFaixa, altura);

        var tracoClaro = new XPen(XColor.FromArgb(90, 255, 255, 255), 1.6);
        foreach (var (cx, cy, lado) in new[] { (46.0, 64.0, 22.0), (206.0, 120.0, 14.0), (40.0, 420.0, 16.0), (196.0, 520.0, 26.0), (120.0, 560.0, 10.0) })
        {
            var estado = gfx.Save();
            gfx.RotateAtTransform(45, new XPoint(cx, cy));
            gfx.DrawRoundedRectangle(tracoClaro, cx - lado / 2, cy - lado / 2, lado, lado, 4, 4);
            gfx.Restore(estado);
        }
        var pontoClaro = new XSolidBrush(XColor.FromArgb(70, 255, 255, 255));
        gfx.DrawEllipse(pontoClaro, 196, 40, 9, 9);
        gfx.DrawEllipse(pontoClaro, 30, 300, 7, 7);

        // Selo: círculo branco com anel no degradê e uma estrela no centro.
        var centro = new XPoint(LarguraFaixa / 2, 238);
        gfx.DrawEllipse(new XSolidBrush(XColor.FromArgb(55, 255, 255, 255)), centro.X - 70, centro.Y - 70, 140, 140);
        gfx.DrawEllipse(XBrushes.White, centro.X - 56, centro.Y - 56, 112, 112);
        gfx.DrawEllipse(new XPen(Rosa, 4), centro.X - 44, centro.Y - 44, 88, 88);
        gfx.DrawPolygon(new XSolidBrush(Misturar(Rosa, Laranja, 0.5)), Estrela(centro, 27, 11.5), XFillMode.Winding);

        var branco = new XSolidBrush(XColors.White);
        var centralizado = new XStringFormat { Alignment = XStringAlignment.Center, LineAlignment = XLineAlignment.Near };
        gfx.DrawString("CERTIFICADO", new XFont("Jakarta ExtraBold", 21), branco, new XRect(0, 330, LarguraFaixa, 30), centralizado);
        gfx.DrawString(ehTrilha ? "de conclusão de trilha" : "de conclusão", new XFont("Jakarta Medium", 12),
            new XSolidBrush(XColor.FromArgb(230, 255, 255, 255)), new XRect(0, 358, LarguraFaixa, 20), centralizado);
    }

    private static XPoint[] Estrela(XPoint centro, double raioExterno, double raioInterno)
    {
        var pontos = new XPoint[10];
        for (var i = 0; i < 10; i++)
        {
            var raio = i % 2 == 0 ? raioExterno : raioInterno;
            var angulo = Math.PI / 5 * i - Math.PI / 2;
            pontos[i] = new XPoint(centro.X + raio * Math.Cos(angulo), centro.Y + raio * Math.Sin(angulo));
        }
        return pontos;
    }

    // Etiqueta arredondada alinhada à direita (ex.: "CURSO").
    private static void DesenharEtiqueta(XGraphics gfx, string texto, double xDireita, double y)
    {
        var fonte = new XFont("Jakarta", 8.5, XFontStyle.Bold);
        var largura = gfx.MeasureString(texto, fonte).Width + 24;
        var fundo = new XSolidBrush(XColor.FromArgb(0xFB, 0xEC, 0xF4));
        gfx.DrawRoundedRectangle(fundo, xDireita - largura, y, largura, 22, 22, 22);
        gfx.DrawString(texto, fonte, new XSolidBrush(RosaTexto),
            new XRect(xDireita - largura, y, largura, 22), XStringFormats.Center);
    }

    // QR code (quando há URL) + código de validação, alinhados à direita do rodapé.
    private static void DesenharValidacao(XGraphics gfx, CertificadoPdfModel model, double xDireita, double y)
    {
        const double tamanhoQr = 74;
        var xTexto = xDireita;
        if (!string.IsNullOrEmpty(model.UrlValidacao))
        {
            using var gerador = new QRCodeGenerator();
            using var dados = gerador.CreateQrCode(model.UrlValidacao, QRCodeGenerator.ECCLevel.M);
            var png = new PngByteQRCode(dados).GetGraphic(8, new byte[] { 0x17, 0x14, 0x1F }, new byte[] { 0xFF, 0xFF, 0xFF });
            using var qr = XImage.FromStream(() => new MemoryStream(png));
            gfx.DrawImage(qr, xDireita - tamanhoQr, y - 6, tamanhoQr, tamanhoQr);
            xTexto = xDireita - tamanhoQr - 12;
        }

        var direita = new XStringFormat { Alignment = XStringAlignment.Far, LineAlignment = XLineAlignment.Near };
        gfx.DrawString("VERIFIQUE A AUTENTICIDADE", new XFont("Jakarta SemiBold", 7.5), new XSolidBrush(TextoSuave),
            new XRect(xTexto - 260, y + 6, 260, 12), direita);
        gfx.DrawString(model.CodigoValidacao, new XFont("Jakarta ExtraBold", 13), new XSolidBrush(RosaTexto),
            new XRect(xTexto - 260, y + 20, 260, 18), direita);
        gfx.DrawString(string.IsNullOrEmpty(model.UrlValidacao) ? "Código de validação" : "Aponte a câmera para o QR code",
            new XFont("Jakarta", 8.5), new XSolidBrush(TextoSuave), new XRect(xTexto - 260, y + 42, 260, 12), direita);
    }

    // Quebra o texto em linhas que cabem na largura; se passar de maxLinhas, a última termina em "…".
    private static List<string> QuebrarLinhas(XGraphics gfx, string texto, XFont fonte, double largura, int maxLinhas)
    {
        var linhas = new List<string>();
        var atual = string.Empty;
        foreach (var palavra in texto.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            var tentativa = atual.Length == 0 ? palavra : atual + " " + palavra;
            if (atual.Length > 0 && gfx.MeasureString(tentativa, fonte).Width > largura)
            {
                linhas.Add(atual);
                atual = palavra;
            }
            else
            {
                atual = tentativa;
            }
        }
        if (atual.Length > 0) linhas.Add(atual);

        if (linhas.Count > maxLinhas)
        {
            linhas = linhas.Take(maxLinhas).ToList();
            var ultima = linhas[^1];
            while (ultima.Length > 0 && gfx.MeasureString(ultima + "…", fonte).Width > largura) ultima = ultima[..^1];
            linhas[^1] = ultima.TrimEnd() + "…";
        }
        return linhas;
    }

    // Degradê desenhado em faixas finas de cor sólida: aparece igual em qualquer leitor de PDF e
    // na impressão (sombreamentos nativos do PDF não são renderizados por todos os visualizadores).
    private static void DegradeVertical(XGraphics gfx, double x, double y, double largura, double altura, int passos = 140)
    {
        var faixa = altura / passos;
        for (var i = 0; i < passos; i++)
            gfx.DrawRectangle(new XSolidBrush(Misturar(Rosa, Laranja, (double)i / (passos - 1))), x, y + i * faixa, largura, faixa + 1.2);
    }

    private static void DegradeHorizontal(XGraphics gfx, double x, double y, double largura, double altura, int passos = 45)
    {
        var faixa = largura / passos;
        for (var i = 0; i < passos; i++)
            gfx.DrawRectangle(new XSolidBrush(Misturar(Rosa, Laranja, (double)i / (passos - 1))), x + i * faixa, y, faixa + 1.2, altura);
    }

    private static XColor Misturar(XColor a, XColor b, double t) => XColor.FromArgb(
        (int)Math.Round(a.R + (b.R - a.R) * t),
        (int)Math.Round(a.G + (b.G - a.G) * t),
        (int)Math.Round(a.B + (b.B - a.B) * t));

    private static string DataPorExtenso(DateTimeOffset data) => $"{data.Day} de {Meses[data.Month - 1]} de {data.Year}";
}
