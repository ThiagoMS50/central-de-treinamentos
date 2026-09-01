using LmsApi.Auth;
using LmsApi.Models;
using LmsApi.Services.Supabase;

namespace LmsApi.Services;

// Regra única de "quem pode ver os detalhes de quem", usada tanto no ranking/gamificação quanto
// no acompanhamento de progresso na Administração: aluno só o próprio, gestor o próprio +
// liderados, admin qualquer um.
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
        if (chamador?.Role == RoleNames.Admin) return true;
        if (chamador?.Role != RoleNames.Gestor) return false;

        var alvo = await _rest.GetByIdAsync<ProfileRow>("profiles", alvoId);
        return alvo?.ManagerId == chamadorId;
    }

    // Para montar listas (ex: uma linha por aluno) sem repetir a consulta do chamador a cada item.
    public async Task<Func<Guid, bool>> ResolverAsync(Guid chamadorId)
    {
        var chamador = await _rest.GetByIdAsync<ProfileRow>("profiles", chamadorId);
        var ehAdmin = chamador?.Role == RoleNames.Admin;
        var idsLiderados = chamador?.Role == RoleNames.Gestor
            ? (await _rest.SelectAsync<ProfileRow>("profiles", PostgrestFilter.Eq("manager_id", chamadorId))).Select(p => p.Id).ToHashSet()
            : new HashSet<Guid>();

        return alvoId => ehAdmin || alvoId == chamadorId || idsLiderados.Contains(alvoId);
    }
}
