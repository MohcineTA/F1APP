<#
.SYNOPSIS
Script de deploiement interactif pour F1App (GitHub + Expo EAS Update)
#>

param (
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE DU DEPLOIEMENT DE LA F1 APP   " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "-> Veuillez entrer le message de la mise a jour (ex: 'Correction du bug')"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "[X] Le message ne peut pas etre vide. Deploiement annule." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Progression en cours..." -ForegroundColor Cyan

$githubSuccess = $false
$expoSuccess = $false

# 2. GIT ADD, COMMIT & PUSH
Write-Host ""
Write-Host "[1/2] Preparation et envoi vers GitHub..." -ForegroundColor Yellow
try {
    $branch = git rev-parse --abbrev-ref HEAD
    if ([string]::IsNullOrWhiteSpace($branch)) { $branch = "production" }

    git add .
    git commit -m "$Message" | Out-Null
    Write-Host "   [OK] Sauvegarde locale reussie (Git Commit)." -ForegroundColor Green

    # Run native git push and check exit code
    git push origin $branch
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
        Write-Host "   [OK] Envoi du code sur GitHub reussi (Git Push)." -ForegroundColor Green
        $githubSuccess = $true
    } else {
        Write-Host "   [X] L'envoi vers GitHub a echoue (Code $LASTEXITCODE)." -ForegroundColor Red
    }
} catch {
    $errMsg = $_.Exception.Message
    if ($errMsg -match "nothing to commit") {
        Write-Host "   [INFO] Aucun changement detecte dans les fichiers pour GitHub." -ForegroundColor Gray
        $githubSuccess = $true # Not really a failure
    } else {
        Write-Host "   [ATTENTION] Probleme inattendu avec Git." -ForegroundColor Red
        Write-Host "   Erreur: $errMsg" -ForegroundColor Gray
    }
}

# 3. EXPO UPDATE
Write-Host ""
Write-Host "[2/2] Mise a jour en direct Expo (EAS Update)..." -ForegroundColor Yellow
try {
    Write-Host "   Execution de EAS Update sur la branche '$branch'..." -ForegroundColor DarkGray
    
    eas update --branch $branch --message "$Message"

    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
        Write-Host "   [OK] Mise a jour Expo poussee avec succes !" -ForegroundColor Green
        $expoSuccess = $true
    } else {
        Write-Host "   [X] Erreur retournee par Expo (Code $LASTEXITCODE)" -ForegroundColor Red
    }
} catch {
    Write-Host "   [X] Erreur grave lors de l'appel a Expo." -ForegroundColor Red
    Write-Host "   Erreur: $_.Exception.Message" -ForegroundColor Gray
}

Write-Host ""
if ($githubSuccess -and $expoSuccess) {
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "   TOUTES LES ETAPES ONT ETE VALIDEES " -ForegroundColor Green
    Write-Host "Vos utilisateurs verront la nouvelle version " -ForegroundColor White
    Write-Host "au prochain demarrage de l'application." -ForegroundColor White
    Write-Host "===============================================" -ForegroundColor Green
} else {
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host "   TERMINE MAIS AVEC DES ERREURS " -ForegroundColor Yellow
    Write-Host "Veuillez lire les messages ci-dessus." -ForegroundColor White
    Write-Host "===============================================" -ForegroundColor Yellow
}
Write-Host ""
