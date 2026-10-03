# Script tối ưu hoá RAM cho WSL2 & Docker Desktop trên Windows
# Tự động giới hạn WSL2 không ngốn quá 4GB RAM của máy

$wslConfigPath = "$env:USERPROFILE\.wslconfig"

$configContent = @"
[wsl2]
# Giới hạn dung lượng RAM tối đa WSL2 (Docker Desktop) được phép cấp phát
memory=4GB

# Số luồng CPU
processors=4

# Dung lượng Swap ảo
swap=2GB

# Tự động giải phóng RAM không dùng trả lại cho Windows
autoMemoryReclaim=gradual
"@

Write-Host "=== Đang cấu hình giới hạn RAM cho WSL2 tại: $wslConfigPath ===" -ForegroundColor Cyan
Set-Content -Path $wslConfigPath -Value $configContent -Encoding UTF8

Write-Host "Đã tạo/cập nhật file .wslconfig thành công!" -ForegroundColor Green
Write-Host "Vui lòng chạy lệnh sau để áp dụng ngay lập tức:" -ForegroundColor Yellow
Write-Host "   wsl --shutdown" -ForegroundColor White
Write-Host "Sau đó khởi động lại Docker Desktop. WSL2 sẽ không bao giờ chiếm quá 4GB RAM nữa!" -ForegroundColor Green
