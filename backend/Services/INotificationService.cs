namespace LmsApi.Services;

// Envio real de e-mail está fora de escopo desta etapa (sem provedor configurado).
// Trocar para um provedor real depois é uma mudança de uma linha no registro de DI (Program.cs).
public interface INotificationService
{
    Task EnviarAsync(string destinatarioEmail, string assunto, string corpo);
}

public class LogOnlyNotificationService : INotificationService
{
    private readonly ILogger<LogOnlyNotificationService> _logger;

    public LogOnlyNotificationService(ILogger<LogOnlyNotificationService> logger)
    {
        _logger = logger;
    }

    public Task EnviarAsync(string destinatarioEmail, string assunto, string corpo)
    {
        _logger.LogInformation("[EMAIL STUB] Para={To} Assunto={Assunto}\n{Corpo}", destinatarioEmail, assunto, corpo);
        return Task.CompletedTask;
    }
}
