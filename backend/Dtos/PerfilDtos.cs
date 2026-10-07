namespace LmsApi.Dtos;

public record ProfileDto(Guid Id, string Nome, string Email, string Role);

public record EnsureProfileRequest(string? Nome);

public record UpdateProfileRequest(string Role);

// Usado pelo próprio usuário para alterar o nome de exibição (ranking, certificados etc.).
public record UpdateMeuNomeRequest(string? Nome);
