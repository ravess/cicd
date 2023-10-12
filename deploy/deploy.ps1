param(
    [string]$CI_COMMIT_REF_NAME
)
# Define connection parameters!
Write-Host "The value of CI_COMMIT_REF_NAME is: $CI_COMMIT_REF_NAME"
$properties = Get-Content -Path "C:\Users\l1ds\bytebrigade\$CI_COMMIT_REF_NAME\config\mysql.properties" | ForEach-Object { 
    if ($_ -match '^(.+?)=(.+)') {
        $propName = $matches[1].Trim()
        $propValue = $matches[2].Trim()
        New-Object PSCustomObject -Property @{ Name = $propName; Value = $propValue }
    }
}

# Retrieve the values from the properties
$databaseName = ($properties | Where-Object { $_.Name -eq 'databaseName' }).Value
$username = ($properties | Where-Object { $_.Name -eq 'username' }).Value
$password = ($properties | Where-Object { $_.Name -eq 'password' }).Value
$sqlFilePath = ($properties | Where-Object { $_.Name -eq 'sqlFilePath' }).Value

try{
# Read SQL script content



# MySQL command to create the database and execute the SQL script.
$mysqlCommand = "mysql -u $username -p$password -D `"$databaseName`" --execute=`"source $sqlFilePath`""

# Start a new process to run the MySQL command and pass SQL script content via standard input
Invoke-Expression -Command "mysql -u $username -p$password -e 'CREATE SCHEMA $databaseName'"
Invoke-Expression -Command $mysqlCommand

Write-Host "Database created and SQL script executed successfully."
}
catch{
  Write-Host "Error: $_"
}

# Load the Docker image from the tar file
Write-Host "C:\Users\l1ds\bytebrigade\$CI_COMMIT_REF_NAME\bin\$CI_COMMIT_REF_NAME.tar"
docker load -i "C:\Users\l1ds\bytebrigade\$CI_COMMIT_REF_NAME\bin\$CI_COMMIT_REF_NAME.tar"

# Run the Docker container
Write-Host "C:\Users\l1ds\bytebrigade\$CI_COMMIT_REF_NAME\config\application.properties"
docker run --name $CI_COMMIT_REF_NAME --env-file "C:\Users\l1ds\bytebrigade\$CI_COMMIT_REF_NAME\config\application.properties" -p 8080:8080 -d $CI_COMMIT_REF_NAME