namespace LmsApi.Dtos;

// "Tipo": "curso" | "trilha"
public record CertificadoListItemDto(Guid Id, string Tipo, string Titulo, DateTimeOffset EmitidoEm, string CodigoValidacao);

public record ValidarCertificadoResponse(string NomeAluno, string Tipo, string Titulo, DateTimeOffset EmitidoEm);
