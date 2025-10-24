@{
    # Exclude test and node_modules folders
    ExcludeRules = @()
    IncludeRules = @()
    Rules = @{
        # Enforce strict mode
        'PSUseDeclaredVarsMoreThanAssignments' = @{ Enabled = $true }
        'PSAvoidUsingWriteHost' = @{ Enabled = $true }
        'PSAvoidUsingPlainTextForPassword' = @{ Enabled = $true }
        'PSAvoidUsingConvertToSecureStringWithPlainText' = @{ Enabled = $true }
        'PSAvoidUsingInvokeExpression' = @{ Enabled = $true }
        'PSAvoidGlobalVars' = @{ Enabled = $true }
        'PSAvoidUsingPositionalParameters' = @{ Enabled = $true }
        'PSUseApprovedVerbs' = @{ Enabled = $true }
        'PSUseConsistentIndentation' = @{ Enabled = $true; IndentationSize = 4 }
        'PSUseConsistentWhitespace' = @{ Enabled = $true }
        'PSUseCorrectCasing' = @{ Enabled = $true }
        'PSUseBOMForUnicodeEncodedFile' = @{ Enabled = $false }
        'PSAvoidLongLines' = @{ Enabled = $true; MaximumLineLength = 120 }
        'PSAvoidTrailingWhitespace' = @{ Enabled = $true }
        'PSPlaceOpenBrace' = @{ Enabled = $true }
        'PSPlaceCloseBrace' = @{ Enabled = $true }
        'PSAlignAssignmentStatement' = @{ Enabled = $true }
        'PSAvoidUsingEmptyCatchBlock' = @{ Enabled = $true }
        'PSAvoidDefaultValueSwitchParameter' = @{ Enabled = $true }
        'PSAvoidUsingEmptyFinallyBlock' = @{ Enabled = $true }
        'PSAvoidUsingEmptyStatementBlock' = @{ Enabled = $true }
        'PSAvoidUsingCmdletAliases' = @{ Enabled = $true }
        'PSAvoidUsingDeprecatedManifestFields' = @{ Enabled = $true }
        'PSAvoidUsingWMICmdlet' = @{ Enabled = $true }
        'PSAvoidUsingComputerNameHardcoded' = @{ Enabled = $true }
        'PSAvoidUsingUsernameAndPasswordParams' = @{ Enabled = $true }
    }
    # Custom rule to flag files missing Set-StrictMode
    CustomRulePath = @('.codingstandards/PSRequireSetStrictMode.psm1')
}
