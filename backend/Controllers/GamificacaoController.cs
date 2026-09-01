using LmsApi.Dtos;
using LmsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

[ApiController]
[Route("api/gamificacao")]
public class GamificacaoController : ControllerBase
{
    private readonly GamificacaoService _gamificacao;
    private readonly ConfiguracoesService _configuracoes;
    private readonly VisibilidadeService _visibilidade;
    private readonly ICurrentUserService _currentUser;

    public GamificacaoController(GamificacaoService gamificacao, ConfiguracoesService configuracoes, VisibilidadeService visibilidade, ICurrentUserService currentUser)
    {
        _gamificacao = gamificacao;
        _configuracoes = configuracoes;
        _visibilidade = visibilidade;
        _currentUser = currentUser;
    }

    private async Task<ActionResult?> BloquearSeRankingDesativadoAsync()
    {
        if (await _configuracoes.RankingHabilitadoAsync()) return null;
        return StatusCode(StatusCodes.Status403Forbidden, new { message = "O ranking está desativado pelo administrador." });
    }

    [HttpGet("me")]
    public async Task<ActionResult<MeuProgressoGamificacaoDto>> Meu()
    {
        if (await BloquearSeRankingDesativadoAsync() is { } bloqueado) return bloqueado;
        return await _gamificacao.ObterMeuProgressoAsync(_currentUser.UserId);
    }

    [HttpGet("ranking")]
    public async Task<ActionResult<List<RankingItemDto>>> Ranking()
    {
        if (await BloquearSeRankingDesativadoAsync() is { } bloqueado) return bloqueado;
        return await _gamificacao.ObterRankingAsync(_currentUser.UserId);
    }

    // Detalhe de um participante (cursos/trilhas concluídos + pontos de cada um + conquistas),
    // usado no pop-up que abre ao clicar em alguém no ranking. Visibilidade: aluno só o próprio,
    // gestor o próprio + liderados, admin qualquer um.
    [HttpGet("participante/{alunoId:guid}")]
    public async Task<ActionResult<DetalheParticipanteDto>> Participante(Guid alunoId)
    {
        if (await BloquearSeRankingDesativadoAsync() is { } bloqueado) return bloqueado;

        if (!await _visibilidade.PodeVerAsync(_currentUser.UserId, alunoId))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Você não tem permissão para ver os detalhes desta pessoa." });

        var detalhe = await _gamificacao.ObterDetalheParticipanteAsync(alunoId);
        if (detalhe is null) return NotFound();
        return detalhe;
    }
}
