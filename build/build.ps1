# Stop the script if any command fails
$ErrorActionPreference = "Stop"

Write-Host "build.ps1 running..."
Write-Host $PWD
Write-Host (Get-ChildItem)

$mvnwPath = "$BUILD_SVR_PATH\$CI_COMMIT_REF_NAME\src\a1"

Write-Host "BUILD_SVR_PATH: $BUILD_SVR_PATH"
Write-Host "CI_COMMIT_REF_NAME: $CI_COMMIT_REF_NAME"
Write-Host "mvnwPath: $mvnwPath"

# Run the Maven Wrapper command
# cmd /c $mvnwPath clean package
cd $mvnwPath
mvn clean package
echo "CD to build server folder"
cd $BUILD_SVR_PATH\$CI_COMMIT_REF_NAME
echo $BUILD_SVR_PATH
echo "Running docker login soon"
# docker login -u ravess -p dckr_pat_tVFMRJHRQOSipp9z5_nllE_LEQ8
docker build -t "$CI_COMMIT_REF_NAME" .
if (Test-Path "bin\$CI_COMMIT_REF_NAME.tar") {
    Remove-Item -Path "bin\$CI_COMMIT_REF_NAME.tar" -Recurse -Force;
}
New-Item -Path "$BUILD_SVR_PATH\$CI_COMMIT_REF_NAME\bin" -ItemType Directory -Force;

docker save -o ".\bin\$CI_COMMIT_REF_NAME.tar" "$CI_COMMIT_REF_NAME"

# Copy the application.properties file into the target directory
# Copy-Item -Path "$BUILD_SVR_PATH\$CI_COMMIT_REF_NAME\src\main\resources\application.properties" -Destination "$BUILD_SVR_PATH\$=CI_COMMIT_REF_NAME\config\application.properties"

Write-Host "Build and copy operations completed!"