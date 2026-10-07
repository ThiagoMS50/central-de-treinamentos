namespace LmsApi.Dtos;

// TutorialResetadoEm: quando o Admin pediu para a pessoa ver o tutorial de novo (null = nunca).
public record ProfileDto(Guid Id, string Nome, string Email, string Role, DateTimeOffset? TutorialResetadoEm);

public record EnsureProfileRequest(string? Nome);

public record UpdateProfileRequest(string Role);

// Usado pelo próprio usuário para alterar o nome de exibição (ranking, certificados etc.).
public record UpdateMeuNomeRequest(string? Nome);
