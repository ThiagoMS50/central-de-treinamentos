using LmsApi.Auth;
using LmsApi.Models;
using LmsApi.Services.Supabase;

namespace LmsApi.Services;

// Regra única de "quem pode ver os detalhes de quem", usada tanto no ranking/gamificação quanto
// no acompanhamento de progresso na Administração: aluno só o próprio, admin qualquer um.
public class VisibilidadeService
{
    private readonly ISupabaseRestClient _rest;

    public VisibilidadeService(ISupabaseRestClient rest)
    {
        _rest = rest;
    }

    public async Task<bool> PodeVerAsync(Guid chamadorId, Guid alvoId)
    {
        if (chamadorId == alvoId) return true;
        var chamador = await _rest.GetByIdAsync<ProfileRow>("profiles", chamadorId);
        return chamador?.Role == RoleNames.Admin;
    }

    // Para montar listas (ex: uma linha por aluno) sem repetir a consulta do chamador a cada item.
    public async Task<Func<Guid, bool>> ResolverAsync(Guid chamadorId)
    {
        var chamador = await _rest.GetByIdAsync<ProfileRow>("profiles", chamadorId);
        var ehAdmin = chamador?.Role == RoleNames.Admin;
        return alvoId => ehAdmin || alvoId == chamadorId;
    }
}
