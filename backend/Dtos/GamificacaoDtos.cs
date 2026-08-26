namespace LmsApi.Dtos;

public record BadgeDto(string Codigo, string Nome, string Descricao, string Icone, bool Conquistado, DateTimeOffset? ConquistadoEm);

public record MeuProgressoGamificacaoDto(int TotalPontos, int Posicao, List<BadgeDto> Badges);

public record RankingItemDto(int Posicao, string Nome, int Pontos, bool SouEu);
