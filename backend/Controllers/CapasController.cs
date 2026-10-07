using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LmsApi.Controllers;

// Galeria de capas prontas (ilustrações na pasta "galeria/" do bucket "capas"). Para acrescentar
// novas opções, basta enviar o arquivo para essa pasta — não precisa mudar código.
[ApiController]
[Route("api/capas")]
[Authorize(Roles = RoleNames.Admin)]
public class CapasController : ControllerBase
{
    private readonly CapaService _capas;

    public CapasController(CapaService capas)
    {
        _capas = capas;
    }

    [HttpGet("galeria")]
    public async Task<ActionResult<List<CapaGaleriaDto>>> Galeria() => await _capas.ListarGaleriaAsync();
}
