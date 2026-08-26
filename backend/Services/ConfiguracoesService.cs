using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services.Supabase;
using Microsoft.Extensions.Logging;

namespace LmsApi.Services;

// Configurações gerais do sistema, guardadas como chave/valor booleano — hoje só o liga/desliga
// do ranking, mas o formato já serve pra outras opções futuras do Admin sem precisar de migração.
public class ConfiguracoesService
{
    private const string ChaveRankingHabilitado = "ranking_habilitado";

    private readonly ISupabaseRestClient _rest;
    private readonly ILogger<ConfiguracoesService> _logger;

    public ConfiguracoesService(ISupabaseRestClient rest, ILogger<ConfiguracoesService> logger)
    {
        _rest = rest;
        _logger = logger;
    }

    public async Task<bool> RankingHabilitadoAsync()
    {
        try
        {
            var linha = (await _rest.SelectAsync<ConfiguracaoRow>("configuracoes", PostgrestFilter.Eq("chave", ChaveRankingHabilitado)))
                .FirstOrDefault();
            return linha?.Valor ?? true;
        }
        catch (SupabaseRestException ex)
        {
            // A tabela "configuracoes" pode ainda não existir se a migração 003 não tiver sido
            // rodada — nesse caso mantemos o comportamento anterior (ranking sempre habilitado)
            // em vez de derrubar toda página que consulta essa configuração.
            _logger.LogWarning(ex, "Não foi possível ler a configuração de ranking; assumindo habilitado.");
            return true;
        }
    }

    public async Task<ConfiguracoesDto> ObterAsync()
    {
        return new ConfiguracoesDto(await RankingHabilitadoAsync());
    }

    public async Task<ConfiguracoesDto> DefinirRankingHabilitadoAsync(bool habilitado)
    {
        await _rest.UpsertAsync<ConfiguracaoRow>("configuracoes", new { chave = ChaveRankingHabilitado, valor = habilitado }, "chave");
        return new ConfiguracoesDto(habilitado);
    }
}
