namespace LmsApi.Dtos;

public record ConcluirCursoResponse(bool Concluido, List<Guid> TrilhasCompletas);

// "Tipo": "curso" | "trilha"
public record CertificadoListItemDto(Guid Id, string Tipo, string Titulo, DateTimeOffset EmitidoEm, string CodigoValidacao);

public record ValidarCertificadoResponse(string NomeAluno, string Tipo, string Titulo, DateTimeOffset EmitidoEm);
