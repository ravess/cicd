# Set test variables
param(
 [string]$appAcronym = "abc",
 [string]$taskID = "abc_11",
 [string]$taskState = "OPEN",
 [string]$taskAction = "Promote",
 [string]$taskName = "popcorn",
 [string]$taskNotesCurrent = "",
 [string]$taskNotesNew = "",
 [string]$taskPlanCurrent = "none",
 [string]$taskPlanNew = "none",
 [string]$taskOwner = "test_owner222"
)

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

# Prepare the promoteTask body
$promoteTask = @{
    taskID = $taskID
    taskName = $taskName
 taskNotesCurrent = $taskNotesCurrent
 taskNotesNew = $taskNotesNew
 taskPlanCurrent = $taskPlanCurrent
 taskPlanNew = $taskPlanNew
 taskState = $taskState
 taskAction = $taskAction
 taskOwner = $taskOwner
} | ConvertTo-Json

# Perform authenticated POST request using the session
$response2 = Invoke-RestMethod "http://localhost:8080/apps/$appAcronym/tasks/$taskID/edit" -Method 'PUT' -Headers $headers -Body $promoteTask -WebSession $session
$promoteMsg = $response2 | ConvertTo-Json | ConvertFrom-Json
$promoteMsg = $promoteMsg.msg

if($promoteMsg -match "Task Successfully Updated.") {
        Write-Host "$scriptName PASS" -ForegroundColor Green
    }
else {
  Write-Host "$scripName FAILED" -ForegroundColor Red
    }
 
return $true