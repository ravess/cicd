$expectedOutput = @{
    "msg" = "New Group devops0 Created."
}
 
# Set the login credentials
$username = "bob"
$password = "temp1234!"

# Create headers with Content-Type
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/json")

# Prepare the login request body
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

# Prepare the request body
$reqBody = @{
    groupName = "devops0"
} | ConvertTo-Json

try {
    # Perform the login request and store the session in a session variable
    $response1 = Invoke-RestMethod 'http://localhost:8080/login' -Method 'POST' -Headers $headers -Body $loginBody -SessionVariable session

    # Perform authenticated POST request using the session
    $response = Invoke-RestMethod 'http://localhost:8080/users/createGroup' -Method 'POST' -Headers $headers -WebSession $session -Body $reqBody 

    if ($response.msg -eq $expectedOutput["msg"]) {
        Write-Host "$scriptName PASSED" -ForegroundColor Green
    } else {
        Write-Host "$scriptName FAILED. Expected: $($expectedOutput["msg"]) but got '$($response.msg)'" -ForegroundColor Red
    }

    return $true
} catch {
    if ($_.Exception.Response -ne $null){
        if($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Unauthorized) {
            Write-Host "Unauthorized (401) response received." -ForegroundColor Red
        } elseif($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden){
            Write-Host "Forbidden (403) response received." -ForegroundColor Red
        }elseif ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Conflict){
            Write-Host "Conflict (409) response received." -ForegroundColor Red
        }
    } else {
        Write-Host "FAILED. Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $true
}

# 

