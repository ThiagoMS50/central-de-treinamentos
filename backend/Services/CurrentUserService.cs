using System.Security.Claims;
using LmsApi.Auth;

namespace LmsApi.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal User =>
        _httpContextAccessor.HttpContext?.User ?? throw new InvalidOperationException("Nenhum HttpContext disponível.");

    public Guid UserId
    {
        get
        {
            var raw = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
        }
    }

    public string Email => User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;

    public string? Nome => User.FindFirst("nome")?.Value;

    public string? Role => User.FindFirst(ClaimTypes.Role)?.Value;

    public Guid? ManagerId
    {
        get
        {
            var raw = User.FindFirst("manager_id")?.Value;
            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }

    public bool HasProfile => Role is not null;
    public bool IsAdmin => Role == RoleNames.Admin;
    public bool IsGestor => Role == RoleNames.Gestor;
}
