try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/update-user-role" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"darkgamer751@gmail.com","role":"admin"}' -StatusVariable status
    Write-Host "API Call Successful!"
    Write-Host "Status: $($status)"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 10)"
} catch {
    Write-Host "API Call Failed!"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    Write-Host "Response Body: $($_.Exception.Response.GetResponseStream() | ForEach-Object { new-object System.IO.StreamReader($_).ReadToEnd() })"
}