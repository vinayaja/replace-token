[CmdletBinding()]
Param(
    [Parameter(Mandatory = $true)]
    [string]$name
)

try {
    Write-Output "$name"
}
catch {
    exit 1
}