using LmsApi.Dtos;
using LmsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/gamificacao")]
public class GamificacaoController : ControllerBase
{
    private readonly GamificacaoService _gamificacao;
    private readonly ICurrentUserService _currentUser;

    public GamificacaoController(GamificacaoService gamificacao, ICurrentUserService currentUser)
    {
        _gamificacao = gamificacao;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<ActionResult<MeuProgressoGamificacaoDto>> Meu()
    {
        return await _gamificacao.ObterMeuProgressoAsync(_currentUser.UserId);
    }

    [HttpGet("ranking")]
    public async Task<ActionResult<List<RankingItemDto>>> Ranking()
    {
        return await _gamificacao.ObterRankingAsync(_currentUser.UserId);
    }

    // Detalhe de um participante (cursos/trilhas concluídos + pontos de cada um + conquistas),
    // usado no pop-up que abre ao clicar em alguém no ranking. Visível a qualquer autenticado,
    // no mesmo espírito de transparência do próprio ranking.
    [HttpGet("participante/{alunoId:guid}")]
    public async Task<ActionResult<DetalheParticipanteDto>> Participante(Guid alunoId)
    {
        var detalhe = await _gamificacao.ObterDetalheParticipanteAsync(alunoId);
        if (detalhe is null) return NotFound();
        return detalhe;
    }
}
