# 页面重命名脚本
$pagesDir = "c:\Users\samsung\Desktop\Yiban\miniprogram\pages"

# 定义重命名映射
$renameMap = @{
    "homepage" = "HomePage"
    "aiDialogue" = "ChatPage"
    "aiDepartmentNavigation" = "DepartmentNavigationPage"
    "aiPharmacyNavigation" = "PharmacyNavigationPage"
    "appointment" = "AppointmentPage"
    "appointmentRecords" = "AppointmentRecordsPage"
    "departmentDetail" = "DepartmentDetailPage"
    "editUserInfo" = "EditUserInfoPage"
    "mine" = "UserInfoPage"
    "utilities" = "UtilitiesPage"
}

# 先删除可能存在的目标文件夹（避免冲突）
foreach ($oldName in $renameMap.Keys) {
    $newName = $renameMap[$oldName]
    $targetPath = Join-Path $pagesDir $newName
    if (Test-Path $targetPath) {
        Remove-Item -Path $targetPath -Recurse -Force
        Write-Host "Removed existing: $newName"
    }
}

# 执行重命名
foreach ($oldName in $renameMap.Keys) {
    $newName = $renameMap[$oldName]
    $oldPath = Join-Path $pagesDir $oldName
    $tempPath = Join-Path $pagesDir ($newName + "_temp")
    $finalPath = Join-Path $pagesDir $newName
    
    if (Test-Path $oldPath) {
        # 复制到临时文件夹
        Copy-Item -Path $oldPath -Destination $tempPath -Recurse
        # 删除原文件夹
        Remove-Item -Path $oldPath -Recurse -Force
        # 重命名临时文件夹
        Rename-Item -Path $tempPath -NewName $newName
        Write-Host "Renamed: $oldName -> $newName"
    } else {
        Write-Host "Not found: $oldName"
    }
}

Write-Host "Page renaming completed!"
