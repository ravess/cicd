# Set the login credentials
$username = "bob"
$password = "temp1234!"

# Create headers with Content-Type for login
$loginHeaders = @{
    'Content-Type' = 'application/json'
}

# Prepare the login request body
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    # Perform the login request and store the session in a session variable
    $loginResponse = Invoke-RestMethod 'http://localhost:8080/login' -Method 'POST' -Headers $loginHeaders -Body $loginBody -SessionVariable session

    # Print the login response for debugging
    #Write-Host "Login Response:"
    #Write-Host $loginResponse

    # Check if the login response contains the expected message or property
    if ($loginResponse -ne $null -and $loginResponse.msg -eq "You are logged In!") {
        #Write-Host "Login Successful for $username" -ForegroundColor Green

        # Set the URI for updating an app
        $updateAppUri = "http://localhost:8080/apps/abc/edit"

        # Request body for updating an app
        $updateRequestBody = @{
            appDescription= "Updated app description"
            appRNumber    = "100"
            appStartDate  = "2023-09-28"
            appEndDate    = "2023-09-29"
        }

        # Create headers with Content-Type for app update
        $updateAppHeaders = @{
            'Content-Type' = 'application/json'
        }

        # Convert the app update request body to JSON
        $updateAppBody = $updateRequestBody | ConvertTo-Json -Depth 10

        # Make the REST API call to update an app using the session
        $updateAppResponse = Invoke-RestMethod -Uri $updateAppUri -Method 'PUT' -Headers $updateAppHeaders -Body $updateAppBody -WebSession $session

        # Optionally print the response for updating an app
        # Write-Host "Update App Response:"
        # Write-Host $updateAppResponse

        # Check if the app update was successful
        if ($updateAppResponse -ne $null -and $updateAppResponse.msg -eq "App Successfully Updated.") {
            Write-Host "$scriptName PASSSED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$scriptName FAILED" -ForegroundColor Red
            return $true
        }
    } else {
        Write-Host "Login FAILED. Invalid response." -ForegroundColor Red
        return $true
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    return $true
}
