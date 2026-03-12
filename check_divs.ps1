$content = Get-Content "public/wholesaler-dashboard.html" -Raw
$openDivs = ([regex]::Matches($content, '<div')).Count
$closeDivs = ([regex]::Matches($content, '</div>')).Count
Write-Host "Open divs: $openDivs"
Write-Host "Close divs: $closeDivs"
Write-Host "Diff (open - close): $($openDivs - $closeDivs)"
