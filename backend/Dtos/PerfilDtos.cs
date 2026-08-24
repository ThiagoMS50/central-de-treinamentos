namespace LmsApi.Dtos;

public record ProfileDto(Guid Id, string Nome, string Email, string Role, Guid? ManagerId);

public record EnsureProfileRequest(string? Nome);

public record UpdateProfileRequest(string Role, Guid? ManagerId);
