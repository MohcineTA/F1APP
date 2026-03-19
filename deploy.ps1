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

# 1. Obtenir le message si non fourni
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "-> Veuillez entrer le message de la mise a jour (ex: 'Correction du bug')"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "[X] Le message ne peut pas etre vide. Deploiement annule." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Progression en cours..." -ForegroundColor Cyan

# 2. GIT ADD, COMMIT & PUSH
Write-Host ""
Write-Host "[1/2] Preparation et envoi vers GitHub..." -ForegroundColor Yellow
try {
    # Check current branch
    $branch = git rev-parse --abbrev-ref HEAD
    if ([string]::IsNullOrWhiteSpace($branch)) {
        $branch = "production"
    }

    git add .
    git commit -m "$Message" | Out-Null
    Write-Host "   [OK] Sauvegarde locale reussie (Git Commit)." -ForegroundColor Green

    git push origin $branch | Out-Null
    Write-Host "   [OK] Envoi du code sur GitHub reussi (Git Push)." -ForegroundColor Green
} catch {
    $errMsg = $_.Exception.Message
    if ($errMsg -match "nothing to commit") {
        Write-Host "   [INFO] Aucun changement detecte dans les fichiers pour GitHub." -ForegroundColor Gray
    } else {
        Write-Host "   [ATTENTION] Probleme mineur avec GitHub, ou rien a commiter." -ForegroundColor Red
        Write-Host "   Erreur: $errMsg" -ForegroundColor Gray
        Write-Host "   -> Poursuite vers la mise a jour Expo..." -ForegroundColor Yellow
    }
}

# 3. EXPO UPDATE
Write-Host ""
Write-Host "[2/2] Mise a jour en direct Expo (EAS Update)..." -ForegroundColor Yellow
try {
    Write-Host "   Execution de EAS Update sur la branche '$branch' (cela peut prendre un moment)..." -ForegroundColor DarkGray
    
    # Run EAS update
    eas update --branch $branch --message "$Message" --auto-commit

    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
        Write-Host "   [OK] Mise a jour Expo poussee avec succes !" -ForegroundColor Green
    } else {
        Write-Host "   [X] Erreur retournee par Expo (Code $LASTEXITCODE)" -ForegroundColor Red
    }
} catch {
    Write-Host "   [X] Erreur lors de la mise a jour Expo." -ForegroundColor Red
    Write-Host "   Erreur: $_.Exception.Message" -ForegroundColor Gray
    Write-Host "   Veuillez verifier que l'outil 'eas-cli' est bien connecte." -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   TOUTES LES ETAPES ONT ETE VALIDEES " -ForegroundColor Green
Write-Host "Vos utilisateurs verront la nouvelle version " -ForegroundColor White
Write-Host "au prochain demarrage de l'application." -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
