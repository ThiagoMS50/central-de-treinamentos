# Builda a imagem e sobe o container localmente, lendo as chaves do Supabase de docker.env.local.
# Uso: copie docker.env.local.example para docker.env.local, preencha os valores, depois rode:
#   .\docker-run.ps1

$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot 'docker.env.local'
if (-not (Test-Path $envFile)) {
    Write-Error "Não encontrei docker.env.local. Copie docker.env.local.example para docker.env.local e preencha com suas chaves do Supabase."
    exit 1
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $parts = $_ -split '=', 2
    if ($parts.Count -eq 2) { $vars[$parts[0].Trim()] = $parts[1].Trim() }
}

$obrigatorias = @('Supabase__Url', 'Supabase__AnonKey', 'Supabase__ServiceRoleKey', 'Supabase__AdminBootstrapEmail')
foreach ($chave in $obrigatorias) {
    $valor = $vars[$chave]
    if ([string]::IsNullOrWhiteSpace($valor) -or $valor -like 'SEU-*' -or $valor -like 'SUA-*' -or $valor -like 'seu-*') {
        Write-Error "Preencha a variável '$chave' em docker.env.local antes de continuar (ainda está com o valor de exemplo)."
        exit 1
    }
}

Write-Host "Construindo a imagem..." -ForegroundColor Cyan
docker build -t central-treinamentos `
    --build-arg VITE_SUPABASE_URL=$($vars['Supabase__Url']) `
    --build-arg VITE_SUPABASE_ANON_KEY=$($vars['Supabase__AnonKey']) `
    $PSScriptRoot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

docker rm -f central-treinamentos *> $null

Write-Host "Subindo o container..." -ForegroundColor Cyan
docker run -d --name central-treinamentos -p 8080:8080 --env-file $envFile central-treinamentos
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pronto! Acesse http://localhost:8080" -ForegroundColor Green
Write-Host "Para ver os logs: docker logs -f central-treinamentos"
Write-Host "Para parar: docker stop central-treinamentos"
