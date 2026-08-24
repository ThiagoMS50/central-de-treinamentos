namespace LmsApi.Auth;

public static class RoleNames
{
    public const string Admin = "admin";
    public const string Gestor = "gestor";
    public const string Aluno = "aluno";

    public const string GestorOuAdmin = Gestor + "," + Admin;
}
