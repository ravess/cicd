# Expected output
$expectedOutput = @{
    "trial" = "abc"
}

# Set the login credentials
$username = "bob"
$password = "temp1234!"

# Create headers with Content-Type
$headers = @{
    "Content-Type" = "application/json"
}

# Prepare the login request body
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

# Perform the login request and store the session in a session variable
$response = Invoke-RestMethod 'http://localhost:8080/login' -Method 'POST' -Headers $headers -Body $loginBody -SessionVariable session

# Perform authenticated GET request using the session
$response = Invoke-RestMethod 'http://localhost:8080/apps/abc' -Method 'GET' -Headers $headers -WebSession $session

# Check if the "trial" value in the response matches the expected value
if ($response.data[0].appAcronym -eq $expectedOutput["trial"]) {
    Write-Host "$scriptName PASSED" -ForegroundColor Green
    return $true
} else {
    $example = $expectedOutput["trial"]
    $result = $response.data[0].appAcronym
    Write-Host "$scriptName FAILED. Expected: $example but got $result" -ForegroundColor Red
    return $true
}

Write-Host "Hello"

Write-Host $response

# Output the response
$response | ConvertTo-Json
