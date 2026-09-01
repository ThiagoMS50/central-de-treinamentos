using LmsApi;
using LmsApi.Auth;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

// Containers Linux com poucos recursos (ex: plano free do Render) têm um limite baixo de
// "inotify instances" — o recurso do SO que o .NET usaria para vigiar o appsettings.json e
// recarregar sozinho se ele mudasse. Isso não é necessário num deploy (o arquivo não muda em
// produção), então desligamos antes de criar o builder para evitar o container derrubar o app.
Environment.SetEnvironmentVariable("DOTNET_hostBuilder__reloadConfigOnChange", "false");

var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicy = "DevCorsPolicy";

builder.Services.Configure<SupabaseOptions>(
    builder.Configuration.GetSection(SupabaseOptions.SectionName));

var supabaseOptions = builder.Configuration.GetSection(SupabaseOptions.SectionName).Get<SupabaseOptions>()
    ?? new SupabaseOptions();

// Tolerante a erros comuns de copiar/colar a variável de ambiente (aspas ou espaços sobrando).
var supabaseUrl = (supabaseOptions.Url ?? string.Empty).Trim().Trim('"').TrimEnd('/');

// Falha alto e claro (mostrando o valor recebido — não é segredo) em vez de deixar o erro
// genérico e confuso do JwtBearer aparecer em toda requisição.
if (!supabaseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        $"Configuração inválida: a variável de ambiente Supabase__Url precisa começar com https://. " +
        $"Valor recebido (comprimento {supabaseUrl.Length}): '{supabaseUrl}'");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpContextAccessor();

// Clientes HTTP que falam com a API REST e de Storage do Supabase usando a service_role key
// (acesso total — a autorização por papel é feita aqui no backend, não pelo RLS do Supabase).
builder.Services.AddHttpClient<ISupabaseRestClient, SupabaseRestClient>(client =>
{
    client.BaseAddress = new Uri($"{supabaseUrl}/rest/v1/");
    client.DefaultRequestHeaders.Add("apikey", supabaseOptions.ServiceRoleKey);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseOptions.ServiceRoleKey}");
});

builder.Services.AddHttpClient<ISupabaseStorageClient, SupabaseStorageClient>(client =>
{
    client.BaseAddress = new Uri($"{supabaseUrl}/storage/v1/");
    client.DefaultRequestHeaders.Add("apikey", supabaseOptions.ServiceRoleKey);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseOptions.ServiceRoleKey}");
});

// Endpoint público do GoTrue (envio de e-mail de recuperação de senha) — usa a anon key, igual
// ao que o supabase-js do frontend usaria, já que não é uma operação privilegiada.
builder.Services.AddHttpClient<ISupabaseAuthClient, SupabaseAuthClient>(client =>
{
    client.BaseAddress = new Uri($"{supabaseUrl}/auth/v1/");
    client.DefaultRequestHeaders.Add("apikey", supabaseOptions.AnonKey);
});

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddSingleton<INotificationService, LogOnlyNotificationService>();
builder.Services.AddScoped<VisibilidadeService>();
builder.Services.AddScoped<GamificacaoService>();
builder.Services.AddScoped<ConfiguracoesService>();
builder.Services.AddScoped<ProgressoService>();
builder.Services.AddScoped<RelatorioService>();
builder.Services.AddScoped<CertificadoPdfService>();

// Precisa ser configurado antes de qualquer PdfDocument/XFont ser criado (ver comentário em
// CertificadoFontResolver.cs — sem isso, gerar certificado falha em produção/Linux).
PdfSharpCore.Fonts.GlobalFontSettings.FontResolver = new CertificadoFontResolver();

builder.Services.AddTransient<IClaimsTransformation, SupabaseClaimsTransformation>();

// Valida os tokens (JWT) emitidos pelo Supabase Auth. O Supabase expõe descoberta OIDC/JWKS
// publicamente, então a validação não depende de nenhum segredo compartilhado — só da URL do projeto.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
        };
    });

// Exige autenticação em toda rota por padrão — só quem tem [AllowAnonymous] explícito fica aberto.
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(DevCorsPolicy);
}

app.UseHttpsRedirection();

// Serve o build do React (copiado para wwwroot) quando rodando "em produção local" ou no Render.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Qualquer rota que não seja /api/* cai no index.html do React (roteamento client-side).
// Precisa ficar público: a proteção de rota real acontece no React (client-side) e nos
// próprios endpoints /api/*, não faz sentido exigir login pra baixar o "casco" da SPA.
app.MapFallbackToFile("index.html").AllowAnonymous();

app.Run();
