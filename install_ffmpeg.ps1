
$FfmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z"
$TargetDir = "C:\ffmpeg"
$ZipFile = "$TargetDir\ffmpeg.7z"

Write-Host "Creating C:\ffmpeg directory..."
New-Item -ItemType Directory -Force -Path $TargetDir

Write-Host "Downloading FFmpeg (this may take a while)..."
Invoke-WebRequest -Uri $FfmpegUrl -OutFile $ZipFile

Write-Host "Extracting FFmpeg..."
# Extract using 7z if available, or expand-archive if zip format (but gyan is 7z)
# Since 7z is not native, we might need a workaround or suggest manual install.
# Wait, let's try downloading the .zip version instead which Powershell can handle natively.

$FfmpegZipUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
$ZipFile = "$TargetDir\ffmpeg.zip"

Invoke-WebRequest -Uri $FfmpegZipUrl -OutFile $ZipFile

Write-Host "Unzipping..."
Expand-Archive -Path $ZipFile -DestinationPath $TargetDir -Force

$ExtractedFolder = Get-ChildItem -Path $TargetDir | Where-Object { $_.PSIsContainer -and $_.Name -like "ffmpeg-*" } | Select-Object -First 1
$BinPath = "$($ExtractedFolder.FullName)\bin"

Write-Host "Adding to User PATH: $BinPath"
$CurrentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($CurrentPath -notlike "*$BinPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$CurrentPath;$BinPath", "User")
    Write-Host "Path updated. Please restart your terminal and VS Code."
} else {
    Write-Host "Path already exists."
}

Write-Host "FFmpeg installation complete!"
