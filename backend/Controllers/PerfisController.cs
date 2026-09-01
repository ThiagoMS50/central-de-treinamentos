using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services;
using LmsApi.Services.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/perfis")]
public class PerfisController : ControllerBase
{
    private readonly ISupabaseRestClient _rest;
    private readonly ICurrentUserService _currentUser;
    private readonly SupabaseOptions _supabaseOptions;
    private readonly ProgressoService _progresso;
    private readonly VisibilidadeService _visibilidade;

    private static readonly string[] PapeisValidos = { RoleNames.Aluno, RoleNames.Gestor, RoleNames.Admin };

    public PerfisController(
        ISupabaseRestClient rest,
        ICurrentUserService currentUser,
        IOptions<SupabaseOptions> supabaseOptions,
        ProgressoService progresso,
        VisibilidadeService visibilidade)
    {
        _rest = rest;
        _currentUser = currentUser;
        _supabaseOptions = supabaseOptions.Value;
        _progresso = progresso;
        _visibilidade = visibilidade;
    }

    private static ProfileDto ToDto(ProfileRow row) => new(row.Id, row.Nome, row.Email, row.Role, row.ManagerId);

    [HttpGet("me")]
    public async Task<ActionResult<ProfileDto>> GetMe()
    {
        var profile = await _rest.GetByIdAsync<ProfileRow>("profiles", _currentUser.UserId);
        if (profile is null) return NotFound();
        return ToDto(profile);
    }

    [HttpPost("ensure")]
    public async Task<ActionResult<ProfileDto>> Ensure([FromBody] EnsureProfileRequest request)
    {
        var existente = await _rest.GetByIdAsync<ProfileRow>("profiles", _currentUser.UserId);
        if (existente is not null) return ToDto(existente);

        var email = _currentUser.Email;
        var nome = !string.IsNullOrWhiteSpace(request.Nome) ? request.Nome! : email.Split('@').FirstOrDefault() ?? email;
        var role = !string.IsNullOrWhiteSpace(_supabaseOptions.AdminBootstrapEmail)
            && string.Equals(email, _supabaseOptions.AdminBootstrapEmail, StringComparison.OrdinalIgnoreCase)
            ? RoleNames.Admin
            : RoleNames.Aluno;

        var criado = await _rest.InsertAsync<ProfileRow>("profiles", new
        {
            id = _currentUser.UserId,
            nome,
            email,
            role
        });

        return ToDto(criado);
    }

    [HttpGet]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<List<ProfileDto>>> Listar([FromQuery] string? role, [FromQuery] string? search)
    {
        var perfis = await _rest.SelectAsync<ProfileRow>("profiles", order: "nome.asc");

        if (!string.IsNullOrWhiteSpace(role))
            perfis = perfis.Where(p => string.Equals(p.Role, role, StringComparison.OrdinalIgnoreCase)).ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termo = search.Trim();
            perfis = perfis.Where(p =>
                p.Nome.Contains(termo, StringComparison.OrdinalIgnoreCase) ||
                p.Email.Contains(termo, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return perfis.Select(ToDto).ToList();
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<ProfileDto>> Atualizar(Guid id, [FromBody] UpdateProfileRequest request)
    {
        if (!PapeisValidos.Contains(request.Role))
            return BadRequest(new { message = "Papel inválido." });

        var atualizado = await _rest.UpdateAsync<ProfileRow>(
            "profiles",
            PostgrestFilter.Eq("id", id),
            new { role = request.Role, manager_id = (object?)request.ManagerId });

        if (atualizado is null) return NotFound();
        return ToDto(atualizado);
    }

    // Acompanhamento de progresso: status de todos os cursos para um aluno específico (usado na
    // Administração e por Gestores). Visibilidade: admin vê qualquer um, gestor só os liderados
    // (e a si mesmo).
    [HttpGet("{alunoId:guid}/progresso")]
    [Authorize(Roles = RoleNames.GestorOuAdmin)]
    public async Task<ActionResult<List<ProgressoCursoDto>>> Progresso(Guid alunoId)
    {
        if (!await _visibilidade.PodeVerAsync(_currentUser.UserId, alunoId))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Você não tem permissão para ver o progresso desta pessoa." });

        var aluno = await _rest.GetByIdAsync<ProfileRow>("profiles", alunoId);
        if (aluno is null) return NotFound();

        return await _progresso.ObterProgressoDeAlunoAsync(alunoId);
    }
}
