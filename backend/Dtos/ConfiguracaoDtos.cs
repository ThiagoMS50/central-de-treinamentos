namespace LmsApi.Dtos;

public record ConfiguracoesDto(bool RankingHabilitado);

public record AtualizarConfiguracoesRequest(bool RankingHabilitado);
