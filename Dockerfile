# Build do frontend (React) — o vite.config.ts já manda o build direto para backend/wwwroot
FROM node:20-alpine AS frontend-build
WORKDIR /src
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
COPY backend/ backend/

# O Vite "grava" essas chaves dentro dos arquivos JS na hora do build (não lê depois, em tempo de
# execução, como o backend faz) — por isso precisam chegar aqui como build args, não só como env
# vars de runtime. O Render passa automaticamente qualquer variável configurada no painel para cá,
# desde que exista um ARG com o mesmo nome.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN cd frontend && npm run build

# Build do backend (.NET), já incluindo o wwwroot gerado acima
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY backend/*.csproj backend/
RUN dotnet restore backend/LmsApi.csproj
COPY backend/ backend/
COPY --from=frontend-build /src/backend/wwwroot backend/wwwroot
RUN dotnet publish backend/LmsApi.csproj -c Release -o /app/publish

# Imagem final, só com o runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# O Render injeta a variável $PORT em tempo de execução — o ASP.NET Core precisa escutar nela.
ENTRYPOINT ["/bin/sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet LmsApi.dll"]
