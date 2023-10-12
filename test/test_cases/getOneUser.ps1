$expectedOutput = @{
    "getOneUser.ps1" = "bob";
}

# Set the login credential
$username = "bob"
$password = "temp1234!"

# Create headers with ContentType
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/json")

# Prepare the login request body
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

# Perform the login request and store the session in a session variable
$response = Invoke-RestMethod 'http://localhost:8080/login' -Method 'POST' -Headers $headers -Body $loginBody -SessionVariable session

# Perform authenticated GET request using the session
$response = Invoke-RestMethod 'http://localhost:8080/users/bob' -Method 'GET' -Headers $headers -WebSession $session

if($response.username -eq $expectedOutput[$scriptName]) {
        Write-Host "$scriptName PASSED" -ForegroundColor Green
    }
    else {
        Write-Host "$scriptName FAILED. Expected: $expectedOutput[$scriptName] but got $output" -ForegroundColor Red
    }

return $true