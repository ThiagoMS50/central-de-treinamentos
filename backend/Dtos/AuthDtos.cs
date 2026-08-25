namespace LmsApi.Dtos;

public record ForgotPasswordRequest(string Email, string RedirectTo);
