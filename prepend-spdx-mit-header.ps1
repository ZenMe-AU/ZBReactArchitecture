# prepend-spdx-mit-header.ps1
# Prepends SPDX MIT license header to all relevant files in the repo

$commentStyles = @{
    '.js'  = '// SPDX-License-Identifier: MIT'
    '.ts'  = '// SPDX-License-Identifier: MIT'
    '.jsx' = '// SPDX-License-Identifier: MIT'
    '.tsx' = '// SPDX-License-Identifier: MIT'
    '.py'  = '# SPDX-License-Identifier: MIT'
    '.sh'  = '# SPDX-License-Identifier: MIT'
    '.ps1' = '# SPDX-License-Identifier: MIT'
}

$exts = $commentStyles.Keys

$files = Get-ChildItem -Path $PSScriptRoot -Recurse -File | Where-Object { $exts -contains $_.Extension }

foreach ($file in $files) {
    $header = $commentStyles[$file.Extension]
    $content = Get-Content $file.FullName -Raw
    if ($content.TrimStart().StartsWith($header)) {
        Write-Host "Header already present: $($file.FullName)" -ForegroundColor Green
        continue
    }
    Set-Content -Path $file.FullName -Value ($header + "`n" + $content)
    Write-Host "Header added: $($file.FullName)" -ForegroundColor Yellow
}

Write-Host "SPDX MIT license header applied to all relevant files." -ForegroundColor Cyan
