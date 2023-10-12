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
    # Write-Host "Login Response:"
    # Write-Host $loginResponse

    # Check if the login response contains the expected message or property
    if ($loginResponse -ne $null -and $loginResponse.msg -eq "You are logged In!") {
        #Write-Host "Login Successful for $username" -ForegroundColor Green

        # Set the URI for creating an app
        $createAppUri = "http://localhost:8080/apps/new"

        # Request body for creating an app
        $requestBody = @{
            appAcronym    = "farmzoo"
            appDescription= "Your app description"
            appRNumber    = "100"
            appStartDate  = "2023-09-25"
            appEndDate    = "2023-09-29"
        }

        # Create headers with Content-Type for app creation
        $appHeaders = @{
            'Content-Type' = 'application/json'
        }

        # Convert the app creation request body to JSON
        $createAppBody = $requestBody | ConvertTo-Json -Depth 10

        # Make the REST API call to create an app using the session
        $createAppResponse = Invoke-RestMethod -Uri $createAppUri -Method 'POST' -Headers $appHeaders -Body $createAppBody -WebSession $session

        # Optionally print the response for creating an app
        #Write-Host "Create App Response:"
        #Write-Host $createAppResponse

        # Check if the app creation was successful
        if ($createAppResponse -ne $null -and $createAppResponse.msg -eq "Application Successfully Created.") {
            Write-Host "$scriptName PASSED" -ForegroundColor Green
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
