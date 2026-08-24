using System.Security.Claims;
using LmsApi.Models;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authentication;

namespace LmsApi.Auth;

// Roda a cada requisição autenticada: busca o perfil (papel/gestor/nome) no Supabase e injeta
// como claims, para que [Authorize(Roles = ...)] funcione normalmente nos controllers.
// Se o perfil ainda não existe (usuário acabou de se cadastrar), nenhuma role é adicionada —
// então rotas com [Authorize(Roles=...)] corretamente barram, mas [Authorize] simples (como o
// endpoint de "ensure profile") continua funcionando.
public class SupabaseClaimsTransformation : IClaimsTransformation
{
    private const string LoadedMarkerClaimType = "lms_loaded";

    private readonly ISupabaseRestClient _restClient;
    private readonly ILogger<SupabaseClaimsTransformation> _logger;

    public SupabaseClaimsTransformation(ISupabaseRestClient restClient, ILogger<SupabaseClaimsTransformation> logger)
    {
        _restClient = restClient;
        _logger = logger;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
            return principal;

        if (identity.HasClaim(c => c.Type == LoadedMarkerClaimType))
            return principal;

        var subClaim = identity.FindFirst("sub")?.Value ?? identity.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(subClaim, out var userId))
        {
            identity.AddClaim(new Claim(LoadedMarkerClaimType, "1"));
            return principal;
        }

        try
        {
            var profile = await _restClient.GetByIdAsync<ProfileRow>("profiles", userId);
            if (profile is not null)
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, profile.Role));
                identity.AddClaim(new Claim("nome", profile.Nome));
                if (profile.ManagerId.HasValue)
                    identity.AddClaim(new Claim("manager_id", profile.ManagerId.Value.ToString()));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao carregar o perfil do Supabase para o usuário {UserId}", userId);
        }

        identity.AddClaim(new Claim(LoadedMarkerClaimType, "1"));
        return principal;
    }
}
