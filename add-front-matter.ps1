# Add YAML Front Matter to Migrated Documents
# Reads path mappings and adds/updates front matter

$base = "C:\Users\chine\Projects\proagentic-dfx"
$mappingsPath = "$base\docs\_index\PHASE4_PATH_MAPPINGS.json"

# Load mappings
$mappings = Get-Content $mappingsPath | ConvertFrom-Json

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Adding YAML Front Matter" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$updated = 0
$skipped = 0

function Get-DocTitle {
    param([string]$content)

    # Try to extract title from first # heading
    if ($content -match '(?m)^#\s+(.+)$') {
        return $matches[1].Trim()
    }

    return "Untitled Document"
}

function Has-FrontMatter {
    param([string]$content)
    return $content.StartsWith("---")
}

function Add-FrontMatter {
    param(
        [string]$filePath,
        [string]$docType
    )

    if (-not (Test-Path $filePath)) {
        Write-Host "File not found: $filePath" -ForegroundColor Yellow
        return $false
    }

    $content = Get-Content $filePath -Raw

    # Skip if already has front matter
    if (Has-FrontMatter $content) {
        Write-Host "Skip (has front matter): $(Split-Path $filePath -Leaf)" -ForegroundColor Gray
        $script:skipped++
        return $false
    }

    # Extract title
    $title = Get-DocTitle $content

    # Generate front matter
    $date = Get-Date -Format "yyyy-MM-dd"
    $frontMatter = @"
---
doc_type: $docType
title: "$title"
version: 1.0.0
date: $date
owner: "@h2-tank-team"
status: accepted
last_verified_at: $date
---

"@

    # Prepend front matter
    $newContent = $frontMatter + $content
    Set-Content -Path $filePath -Value $newContent -Encoding UTF8

    Write-Host "Added front matter: $(Split-Path $filePath -Leaf)" -ForegroundColor Green
    $script:updated++
    return $true
}

# Process each mapped document
foreach ($mapping in $mappings) {
    $targetPath = $mapping.Target
    $docType = $mapping.Classification

    if (Test-Path $targetPath) {
        Add-FrontMatter -filePath $targetPath -docType $docType
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Front Matter Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Documents updated: $updated" -ForegroundColor Green
Write-Host "Documents skipped (already has front matter): $skipped" -ForegroundColor Yellow

Write-Host "`nFront matter addition complete!`n" -ForegroundColor Green
