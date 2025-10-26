param(
  [int]$Port = 5174
)

# Ir para a raiz do repo (pasta acima deste script)
Set-Location -Path "$PSScriptRoot\.."

# 1) Sobe DB + backend
docker compose up -d db backend

# 2) Health check (opcional)
try { curl http://localhost:4000/api/health } catch {}

# 3) Arranca o frontend (Vite) na 5174
Set-Location -Path ".\frontend"
if (!(Test-Path .\node_modules)) { npm install }

# Liberta portas (5173/5174) se necessário
foreach ($p in 5173, $Port) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

npm run dev -- --port $Port --strictPort
