# Detecta configuracoes do sistema Windows

Write-Host "Detectando configuracoes do sistema..." -ForegroundColor Cyan

# IP local
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress

# Nome do computador
$computerName = $env:COMPUTERNAME

# Usuario
$userName = $env:USERNAME

# Impressoras
$printers = Get-Printer | Select-Object -First 5 Name, DriverName, PortName
$defaultPrinter = (Get-Printer | Where-Object {$_.Default -eq $true}).Name
if (-not $defaultPrinter -and $printers) {
    $defaultPrinter = $printers[0].Name
}

# Porta disponivel
$port = 3000
$testPort = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
if ($testPort) {
    for ($i = 3001; $i -le 3010; $i++) {
        $testPort = Test-NetConnection -ComputerName localhost -Port $i -InformationLevel Quiet -WarningAction SilentlyContinue
        if (-not $testPort) {
            $port = $i
            break
        }
    }
}

# Criar objeto de configuracao
$config = @{
    ip = $ipAddress
    computerName = $computerName
    userName = $userName
    port = $port
    defaultPrinter = $defaultPrinter
    printers = $printers
}

# Exportar para JSON
$config | ConvertTo-Json -Depth 3 | Out-File -FilePath "system-config.json" -Encoding UTF8

Write-Host "`nConfiguracoes detectadas:" -ForegroundColor Green
Write-Host "  IP Local: $ipAddress"
Write-Host "  Computador: $computerName"
Write-Host "  Usuario: $userName"
Write-Host "  Porta: $port"
Write-Host "  Impressora padrao: $defaultPrinter"
Write-Host "`nArquivo salvo: system-config.json" -ForegroundColor Yellow

return $config
