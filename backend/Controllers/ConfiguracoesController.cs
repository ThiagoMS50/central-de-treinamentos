using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/configuracoes")]
public class ConfiguracoesController : ControllerBase
{
    private readonly ConfiguracoesService _configuracoes;

    public ConfiguracoesController(ConfiguracoesService configuracoes)
    {
        _configuracoes = configuracoes;
    }

    // Qualquer autenticado pode ler (o frontend precisa saber se mostra ou não o ranking).
    [HttpGet]
    public async Task<ActionResult<ConfiguracoesDto>> Obter()
    {
        return await _configuracoes.ObterAsync();
    }

    [HttpPut]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<ActionResult<ConfiguracoesDto>> Atualizar([FromBody] AtualizarConfiguracoesRequest request)
    {
        return await _configuracoes.DefinirRankingHabilitadoAsync(request.RankingHabilitado);
    }
}
