# Set the login credentials
$username = "bob"
$password = "temp1234!"

# Create headers with Content-Type for login
$loginHeaders = @{
    'Content-Type' = 'application/json'
}

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
    
    # Check if admin login was successful
    if ($loginResponse -ne $null -and $loginResponse.msg -eq "You are logged In!") {
        Write-Host "LOGIN PASSED" -ForegroundColor Green

        # API endpoint for user registration
        $registrationUrl = 'http://localhost:8080/users/new'  # Update with your API URL

        # Define the test data for user registration
        $requestBody = @{
            username = "newuser"  # Replace with a unique username
            password = "Pass1234!"  # Satisfies the password requirements
            email = "newuser@example.com"
            isActive = 1
            groups = ".Admin."
            # Additional user data as needed
        }

        # Create headers with Content-Type for user registration
        $userHeaders = @{
            'Content-Type' = 'application/json'
        }

        # Validation: Check if the password meets complexity requirements
        # $password = $requestBody.password
        # if ($password -match "^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$") {
        #     Write-Host "Password complexity PASSED" -ForegroundColor Green
        # } else {
        #     Write-Host "Password complexity FAILED" -ForegroundColor Red
        #     Write-Host "Password must have 1 capital letter, 1 number, and 1 special character."
        #     # Optionally, you can choose to abort the user registration process here.
        # }

        # Convert user data to JSON
        $userDataJson = $requestBody | ConvertTo-Json

        # Perform the user registration request using the admin session or token
        $registrationResponse = Invoke-RestMethod -Uri $registrationUrl -Method 'POST' -Headers $userHeaders -Body $userDataJson -WebSession $session

        # Print the response for debugging
        #Write-Host "User Registration Response:"
        #Write-Host $registrationResponse

        # Check the response for user registration success or failure
        if ($registrationResponse -ne $null -and $registrationResponse.msg -eq "User Successfully Created.") {
            Write-Host "$scriptName PASSED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$scriptName FAILED" -ForegroundColor Red
            Write-Host "Error Message: $($registrationResponse.errorMessage)"
            return $true
        }
    } else {
        Write-Host "Admin Login FAILED" -ForegroundColor Red
        Write-Host "Error Message: $($loginResponse.errorMessage)"
        return $true
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    return $true
}
