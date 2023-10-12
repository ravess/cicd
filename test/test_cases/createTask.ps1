# Set test variables
$appAcronym = "abc"
$taskName = "hello"
$taskDescription = "This is a test description."
$taskNotes = "No creation notes entered."
$taskPlan = ""


# Create headers with Content-Type
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/json")

# Prepare the login request body
$loginBody = @{
    username = "bob"
    password = "temp1234!"
} | ConvertTo-Json

# Perform the login request and store the session in a session variable
$response = Invoke-RestMethod 'http://localhost:8080/login' -Method 'POST' -Headers $headers -Body $loginBody -SessionVariable session

# Prepare the createTask body
$createTask = @{
    taskName = $taskName
 taskDescription = $taskDescription
 taskNotes = $taskNotes
 taskPlan = $taskPlan
} | ConvertTo-Json

# Perform authenticated POST request using the session
$response2 = Invoke-RestMethod "http://localhost:8080/apps/$appAcronym/tasks/new" -Method 'POST' -Headers $headers -Body $createTask -WebSession $session
$promoteMsg = $response2 | ConvertTo-Json | ConvertFrom-Json
$promoteMsg = $promoteMsg.msg

if($promoteMsg -match "Task Successfully Created.") {
        Write-Host "$scriptName PASSED" -ForegroundColor Green
    }
else {
  Write-Host "$scriptName FAILED" -ForegroundColor Red
    }

return $true