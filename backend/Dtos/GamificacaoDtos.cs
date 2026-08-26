namespace LmsApi.Dtos;

public record BadgeDto(string Codigo, string Nome, string Descricao, string Icone, bool Conquistado, DateTimeOffset? ConquistadoEm);

public record MeuProgressoGamificacaoDto(int TotalPontos, int Posicao, List<BadgeDto> Badges);

public record RankingItemDto(int Posicao, Guid AlunoId, string Nome, int Pontos, bool SouEu, bool PodeVerDetalhes);

public record ItemConcluidoDto(string Titulo, int Pontos, DateTimeOffset ConcluidoEm);

public record DetalheParticipanteDto(
    string Nome,
    int TotalPontos,
    List<ItemConcluidoDto> Cursos,
    List<ItemConcluidoDto> Trilhas,
    List<BadgeDto> Badges);
