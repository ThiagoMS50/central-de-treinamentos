using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly SupabaseOptions _supabaseOptions;

    public HealthController(IOptions<SupabaseOptions> supabaseOptions)
    {
        _supabaseOptions = supabaseOptions.Value;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            supabaseConfigured = !string.IsNullOrWhiteSpace(_supabaseOptions.Url)
                && !string.IsNullOrWhiteSpace(_supabaseOptions.AnonKey)
        });
    }
}
