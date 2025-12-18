# VIT-Verse COMPLETE API TESTER (17 Modules + JSON + Errors) - FIXED
$baseUrl = "http://localhost:4000"
$ErrorActionPreference = "Continue"

# ALL 17 Modules + Health + Error Tests
$tests = @(
    # Health & Status
    @{ name = "Health"; method = "GET"; url = "/health"; expect = 200 },
    
    # Auth Module
    @{ name = "Auth Base"; method = "GET"; url = "/api/auth"; expect = 200 },
    @{ name = "Auth Register"; method = "POST"; url = "/api/auth/register"; body = '{"userName":"test","userEmail":"test@vit.ac.in","userPassword":"pass","userPhone":1234567890}'; expect = 201 },
    @{ name = "Auth Login"; method = "POST"; url = "/api/auth/login"; body = '{"userEmail":"test@vit.ac.in","userPassword":"pass"}'; expect = 200 },
    
    # Students Module
    @{ name = "Students Base"; method = "GET"; url = "/api/students"; expect = 200 },
    @{ name = "Create Student"; method = "POST"; url = "/api/students"; body = '{"studentRegID":"20BCE1234","userID":1,"studentBranch":"CSE","studentYear":3}'; expect = 201 },
    @{ name = "Get Student"; method = "GET"; url = "/api/students/1"; expect = 200 },
    @{ name = "Update Student"; method = "PUT"; url = "/api/students/1"; body = '{"studentBranch":"IT"}'; expect = 200 },
    @{ name = "Delete Student"; method = "DELETE"; url = "/api/students/1"; expect = 200 },
    
    # Teachers Module
    @{ name = "Teachers Base"; method = "GET"; url = "/api/teachers"; expect = 200 },
    @{ name = "Create Teacher"; method = "POST"; url = "/api/teachers"; body = '{"teacherID":"T001","userID":2,"teacherSchool":"CSE"}'; expect = 201 },
    
    # Videos Module
    @{ name = "Videos Base"; method = "GET"; url = "/api/videos"; expect = 200 },
    @{ name = "Create Video"; method = "POST"; url = "/api/videos"; body = '{"channelID":1,"title":"Test Video","description":"Test"}'; expect = 201 },
    
    # Channels Module
    @{ name = "Channels Base"; method = "GET"; url = "/api/channels"; expect = 200 },
    
    # ALL 17 Modules Base Tests
    @{ name = "Tags"; method = "GET"; url = "/api/tags"; expect = 200 },
    @{ name = "Jobs"; method = "GET"; url = "/api/jobs"; expect = 200 },
    @{ name = "Notifications"; method = "GET"; url = "/api/notifications"; expect = 200 },
    @{ name = "Playlists"; method = "GET"; url = "/api/playlists"; expect = 200 },
    @{ name = "Subscriptions"; method = "GET"; url = "/api/subscriptions"; expect = 200 },
    @{ name = "Likes"; method = "GET"; url = "/api/likes"; expect = 200 },
    @{ name = "Comments"; method = "GET"; url = "/api/comments"; expect = 200 },
    @{ name = "Views"; method = "GET"; url = "/api/views"; expect = 200 },
    @{ name = "Images"; method = "GET"; url = "/api/images"; expect = 200 },
    @{ name = "Reports"; method = "GET"; url = "/api/reports"; expect = 200 },
    @{ name = "Roles"; method = "GET"; url = "/api/roles"; expect = 200 },
    @{ name = "Users"; method = "GET"; url = "/api/users"; expect = 200 },
    @{ name = "Videostats"; method = "GET"; url = "/api/videostats"; expect = 200 },
    
    # Error Tests
    @{ name = "Invalid Route"; method = "GET"; url = "/invalid"; expect = 404 }
)

Write-Host "`nRocket Testing VIT-Verse API (25+ Endpoints)..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Yellow

$success = 0
$failed = 0
$total = $tests.Count

foreach ($test in $tests) {
    $url = "$baseUrl$($test.url)"
    $name = $test.name.PadRight(20)
    
    Write-Host "[$($test.method)] $name" -NoNewline -ForegroundColor White
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        $body = if ($test.body) { $test.body } else { $null }
        
        $params = @{
            Uri = $url
            Method = $test.method
            Headers = $headers
            UseBasicParsing = $true
            TimeoutSec = 5
        }
        
        if ($body) { $params.Body = $body }
        
        $response = Invoke-WebRequest @params
        
        $status = $response.StatusCode
        if ($status -eq $test.expect) { 
            $success++
            Write-Host " OK ($status)" -ForegroundColor Green
        } else {
            $failed++
            Write-Host " FAIL ($status expected $($test.expect))" -ForegroundColor Red
        }
    }
    catch {
        $status = if ($_.Exception.Response) { 
            $_.Exception.Response.StatusCode.value__ 
        } else { 
            500 
        }
        
        if ($status -eq $test.expect) { 
            $success++
            Write-Host " OK ($status)" -ForegroundColor Green
        } else {
            $failed++
            Write-Host " FAIL ($status expected $($test.expect))" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Success: $success / $total" -ForegroundColor $(if ($success -ge ($total * 0.8)) { 'Green' } else { 'Red' })
Write-Host "Failed:  $failed" -ForegroundColor $(if ($failed -eq 0) { 'Green' } else { 'Red' })
Write-Host "Server: $baseUrl/health`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "ALL TESTS PASSED! 🎉" -ForegroundColor Green
} else {
    Write-Host "Some tests failed - check individual results above." -ForegroundColor Yellow
}
