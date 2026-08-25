using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ISupabaseAuthClient _authClient;

    public AuthController(ISupabaseRestClient rest, ISupabaseAuthClient authClient)
    {
        _rest = rest;
        _authClient = authClient;
    }

    [HttpPost("esqueci-senha")]
    public async Task<IActionResult> EsqueciSenha([FromBody] ForgotPasswordRequest request)
    {
        var email = request.Email?.Trim();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.RedirectTo))
            return BadRequest(new { message = "Informe um e-mail." });

        var perfis = await _rest.SelectAsync<ProfileRow>("profiles", PostgrestFilter.Ilike("email", email));
        if (perfis.Count == 0)
            return NotFound(new { message = "Não encontramos um cadastro com este e-mail." });

        try
        {
            await _authClient.SendPasswordRecoveryAsync(email, request.RedirectTo);
        }
        catch (SupabaseRestException)
        {
            return StatusCode(502, new { message = "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos." });
        }

        return Ok(new { message = "E-mail de redefinição enviado." });
    }
}
