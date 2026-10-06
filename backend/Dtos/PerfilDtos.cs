namespace LmsApi.Dtos;

public record ProfileDto(Guid Id, string Nome, string Email, string Role, Guid? ManagerId);

public record EnsureProfileRequest(string? Nome);

public record UpdateProfileRequest(string Role, Guid? ManagerId);

// Usado pelo próprio usuário para alterar o nome de exibição (ranking, certificados etc.).
public record UpdateMeuNomeRequest(string? Nome);
