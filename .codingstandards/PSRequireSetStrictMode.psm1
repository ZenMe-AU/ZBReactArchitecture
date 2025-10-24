function PSRequireSetStrictMode {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [System.Management.Automation.Language.Ast] $Ast,
        [Parameter(Mandatory = $true)]
        [System.Collections.Generic.IReadOnlyList[System.Management.Automation.Language.Token]] $Tokens,
        [Parameter(Mandatory = $true)]
        [string] $FilePath
    )

    $found = $Ast.FindAll({
        param($node)
        $node -is [System.Management.Automation.Language.CommandAst] -and
        $node.CommandElements[0].Value -eq 'Set-StrictMode'
    }, $true)

    if (-not $found) {
        $diagnosticRecordType = [Microsoft.Windows.PowerShell.ScriptAnalyzer.Generic.DiagnosticRecord]
        return $diagnosticRecordType::new(
            'File does not contain Set-StrictMode.',
            $Ast.Extent,
            'PSRequireSetStrictMode',
            'Warning',
            $null
        )
    }
}

Export-ModuleMember -Function PSRequireSetStrictMode
