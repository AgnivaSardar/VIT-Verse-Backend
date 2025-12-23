# VIT-Verse FULL API TESTER (Using provided $tests spec)
$baseUrl = "http://localhost:5000"
$ErrorActionPreference = "Continue"

# ================== TEST DEFINITIONS ==================
$tests = @(
    # === PUBLIC ENDPOINTS ===
    @{ name = "Health Check"; method = "GET"; url = "/health"; expect = 200; auth = $false },

    # === AUTH (Public) ===
    @{ name = "Auth Register"; method = "POST"; url = "/api/auth/register"; expect = 201; auth = $false; body = @{name="TestUser";email="test@example.com";password="Pass123!"} },
    @{ name = "Auth Login"; method = "POST"; url = "/api/auth/login"; expect = 200; auth = $false; body = @{email="test@example.com";password="Pass123!"} },

    # === VIDEOS ===
    @{ name = "List Videos"; method = "GET"; url = "/api/videos"; expect = 200; auth = $false },
    @{ name = "Get Video"; method = "GET"; url = "/api/videos/1"; expect = 200; auth = $false },

    # === CHANNELS ===
    @{ name = "List Channels"; method = "GET"; url = "/api/channels"; expect = 200; auth = $false },
    @{ name = "Get Channel"; method = "GET"; url = "/api/channels/1"; expect = 200; auth = $false },
    @{ name = "Get Channel by Name"; method = "GET"; url = "/api/channels/name/TestChannel/user/1"; expect = 200; auth = $false },

    # === COMMENTS ===
    @{ name = "Get Comment"; method = "GET"; url = "/api/comments/1"; expect = 200; auth = $false },

    # === LIKES ===
    @{ name = "Get Likes Count"; method = "GET"; url = "/api/likes/count/1"; expect = 200; auth = $false },
    @{ name = "Check User Liked Video"; method = "GET"; url = "/api/likes/hasLiked/user/1/video/1"; expect = 200; auth = $false },

    # === PLAYLISTS ===
    @{ name = "Get Playlist"; method = "GET"; url = "/api/playlists/1"; expect = 200; auth = $false },

    # === USERS ===
    @{ name = "List Users"; method = "GET"; url = "/api/users"; expect = 200; auth = $false },
    @{ name = "Get User"; method = "GET"; url = "/api/users/1"; expect = 200; auth = $false },

    # === STUDENTS ===
    @{ name = "Get Student"; method = "GET"; url = "/api/students/1"; expect = 200; auth = $false },

    # === TEACHERS ===
    @{ name = "List Teachers"; method = "GET"; url = "/api/teachers"; expect = 200; auth = $false },
    @{ name = "Get Teacher"; method = "GET"; url = "/api/teachers/1"; expect = 200; auth = $false },

    # === NOTIFICATIONS ===
    @{ name = "List Notifications"; method = "GET"; url = "/api/notifications"; expect = 200; auth = $false },
    @{ name = "Get Notification"; method = "GET"; url = "/api/notifications/1"; expect = 200; auth = $false },

    # === REPORTS ===
    @{ name = "Get Report"; method = "GET"; url = "/api/reports/1"; expect = 200; auth = $false },

    # === VIEWS ===
    @{ name = "List Views"; method = "GET"; url = "/api/views"; expect = 200; auth = $false },
    @{ name = "Get View"; method = "GET"; url = "/api/views/1"; expect = 200; auth = $false },

    # === VIDEO STATS ===
    @{ name = "List Video Stats"; method = "GET"; url = "/api/videostats"; expect = 200; auth = $false },
    @{ name = "Get Video Stats"; method = "GET"; url = "/api/videostats/1"; expect = 200; auth = $false },
    @{ name = "Increment Views"; method = "POST"; url = "/api/videostats/1/increment-views"; expect = 200; auth = $false },

    # === IMAGES ===
    @{ name = "Get Image"; method = "GET"; url = "/api/images/1"; expect = 200; auth = $false },

    # === TAGS (Public reads) ===
    @{ name = "Get Tag"; method = "GET"; url = "/api/tags/1"; expect = 200; auth = $false },
    @{ name = "List Popular Tags"; method = "GET"; url = "/api/tags/popular"; expect = 200; auth = $false },
    @{ name = "Search Tags"; method = "GET"; url = "/api/tags/search"; expect = 200; auth = $false },
    @{ name = "Get Video Tags"; method = "GET"; url = "/api/tags/1/tags"; expect = 200; auth = $false },

    # === AUTHENTICATED POST/PUT/DELETE ENDPOINTS ===
    @{ name = "Create Channel"; method = "POST"; url = "/api/channels"; expect = 201; auth = $true; body = @{channelName="TestChannel";description="Test"} },
    @{ name = "Create Comment"; method = "POST"; url = "/api/comments"; expect = 201; auth = $true; body = @{videoID=1;text="Great video!"} },
    @{ name = "Like Video"; method = "POST"; url = "/api/likes"; expect = 201; auth = $true; body = @{userID=1;vidID=1} },
    @{ name = "Create Playlist"; method = "POST"; url = "/api/playlists"; expect = 201; auth = $true; body = @{name="Favorites";description="My favorites"} },
    @{ name = "Create User"; method = "POST"; url = "/api/users"; expect = 201; auth = $true; body = @{userName="TestUser";userEmail="user@test.com";userPassword="Pass123!"} },
    @{ name = "Create Student"; method = "POST"; url = "/api/students"; expect = 201; auth = $true; body = @{studentRegID="20BCE1234";userID=1;studentBranch="CSE";studentYear=3} },
    @{ name = "Create Teacher"; method = "POST"; url = "/api/teachers"; expect = 201; auth = $true; body = @{teacherID="T001";userID=1;teacherSchool="VIT CSE"} },
    @{ name = "Create Notification"; method = "POST"; url = "/api/notifications"; expect = 201; auth = $true; body = @{userID=1;entityID=1;type="message";message="Test"} },
    @{ name = "Create Report"; method = "POST"; url = "/api/reports"; expect = 201; auth = $true; body = @{reportedID=1;reason="Spam"} },
    @{ name = "Create View"; method = "POST"; url = "/api/views"; expect = 201; auth = $true; body = @{videoID=1;userID=1} },
    @{ name = "Create Image"; method = "POST"; url = "/api/images"; expect = 201; auth = $true; body = @{imageURL="https://example.com/img.jpg";alt="Test"} },
    @{ name = "Create Tag"; method = "POST"; url = "/api/tags"; expect = 201; auth = $true; body = @{tagName="Tutorial"} },
    @{ name = "Add Tags to Video"; method = "POST"; url = "/api/tags/1/tags"; expect = 201; auth = $true; body = @{tags=@("Tutorial","Learn")} },
    @{ name = "Subscribe to Channel"; method = "POST"; url = "/api/channels/1/subscribe"; expect = 201; auth = $true; body = @{userID=1} },
    @{ name = "Subscribe"; method = "POST"; url = "/api/subscriptions/subscribe"; expect = 201; auth = $true; body = @{channelID=1;userID=1} },
    @{ name = "Mark Notification Read"; method = "POST"; url = "/api/notifications/1/mark-as-read"; expect = 200; auth = $true },
    @{ name = "Increment Likes"; method = "POST"; url = "/api/videostats/1/increment-likes"; expect = 200; auth = $true },
    @{ name = "Transcode Job"; method = "POST"; url = "/api/jobs/transcode"; expect = 201; auth = $true; body = @{videoID=1;format="mp4"} },

    # === UPDATE ENDPOINTS ===
    @{ name = "Update Channel"; method = "PUT"; url = "/api/channels/1"; expect = 200; auth = $true; body = @{channelName="UpdatedChannel"} },
    @{ name = "Update Comment"; method = "PUT"; url = "/api/comments/1"; expect = 200; auth = $true; body = @{text="Updated comment"} },
    @{ name = "Update Playlist"; method = "PUT"; url = "/api/playlists/1"; expect = 200; auth = $true; body = @{name="Updated Playlist"} },
    @{ name = "Update User"; method = "PUT"; url = "/api/users/1"; expect = 200; auth = $true; body = @{userName="UpdatedUser"} },
    @{ name = "Update Student"; method = "PUT"; url = "/api/students/1"; expect = 200; auth = $true; body = @{studentYear=4} },
    @{ name = "Update Teacher"; method = "PUT"; url = "/api/teachers/1"; expect = 200; auth = $true; body = @{teacherSchool="VIT IT"} },
    @{ name = "Update Notification"; method = "PUT"; url = "/api/notifications/1"; expect = 200; auth = $true; body = @{message="Updated message"} },
    @{ name = "Update Report"; method = "PUT"; url = "/api/reports/1"; expect = 200; auth = $true; body = @{status="resolved"} },
    @{ name = "Update View"; method = "PUT"; url = "/api/views/1"; expect = 200; auth = $true; body = @{watchTime=120} },
    @{ name = "Update Image"; method = "PUT"; url = "/api/images/1"; expect = 200; auth = $true; body = @{alt="Updated alt text"} },

    # === DELETE ENDPOINTS ===
    @{ name = "Delete Channel"; method = "DELETE"; url = "/api/channels/1"; expect = 200; auth = $true },
    @{ name = "Unlike Video"; method = "DELETE"; url = "/api/likes"; expect = 200; auth = $true; body = @{userID=1;vidID=1} },
    @{ name = "Delete Playlist"; method = "DELETE"; url = "/api/playlists/1"; expect = 200; auth = $true },
    @{ name = "Delete User"; method = "DELETE"; url = "/api/users/1"; expect = 200; auth = $true },
    @{ name = "Delete Student"; method = "DELETE"; url = "/api/students/1"; expect = 200; auth = $true },
    @{ name = "Delete Teacher"; method = "DELETE"; url = "/api/teachers/1"; expect = 200; auth = $true },
    @{ name = "Delete Notification"; method = "DELETE"; url = "/api/notifications/1"; expect = 200; auth = $true },
    @{ name = "Delete Report"; method = "DELETE"; url = "/api/reports/1"; expect = 200; auth = $true },
    @{ name = "Delete View"; method = "DELETE"; url = "/api/views/1"; expect = 200; auth = $true },
    @{ name = "Delete Image"; method = "DELETE"; url = "/api/images/1"; expect = 200; auth = $true },
    @{ name = "Delete Notifications by User"; method = "DELETE"; url = "/api/notifications/user/1"; expect = 200; auth = $true },
    @{ name = "Unsubscribe from Channel"; method = "DELETE"; url = "/api/channels/1/unsubscribe"; expect = 200; auth = $true; body = @{userID=1} },
    @{ name = "Unsubscribe"; method = "POST"; url = "/api/subscriptions/unsubscribe"; expect = 200; auth = $true; body = @{channelID=1;userID=1} },
    @{ name = "Decrement Likes"; method = "POST"; url = "/api/videostats/1/decrement-likes"; expect = 200; auth = $true },

    # === SPECIAL ENDPOINTS ===
    @{ name = "Activate User"; method = "POST"; url = "/api/users/1/activate"; expect = 200; auth = $true },
    @{ name = "Deactivate User"; method = "POST"; url = "/api/users/1/deactivate"; expect = 200; auth = $true },
    @{ name = "Get My Videos"; method = "GET"; url = "/api/videos/me"; expect = 200; auth = $true },
    @{ name = "Get User Notifications"; method = "GET"; url = "/api/notifications/user/1"; expect = 200; auth = $true },

    # === INVALID ROUTE (Should 404) ===
    @{ name = "Invalid Route"; method = "GET"; url = "/invalid"; expect = 404; auth = $false }
)

$total   = $tests.Count
$success = 0
$failed  = 0
$token   = $null

Write-Host "`nVIT-Verse FULL API TESTER ($total endpoints)" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "Rate Limit Protection: 200ms delay between requests`n" -ForegroundColor Gray

foreach ($test in $tests) {
    $fullUrl = "$baseUrl$($test.url)"
    $name    = $test.name.PadRight(35)
    $method  = $test.method
    $expect  = $test.expect
    $authReq = $test.auth
    $bodyObj = $test.body

    Write-Host "[$method] $name" -NoNewline -ForegroundColor White
    
    # Add delay to avoid rate limiting (100 req/15min = ~1 req per 9 seconds, but we'll use 200ms)
    Start-Sleep -Milliseconds 200

    try {
        $headers = @{}
        # Bypass rate limiting in tests
        $headers["x-bypass-rate-limit"] = "1"

        # If we already have a token and this test requires auth, set Authorization header
        if ($authReq -and $token) {
            $headers["Authorization"] = "Bearer $token"
        }

        # Convert hashtable body to JSON if present
        $bodyJson = $null
        if ($bodyObj) {
            $bodyJson = ($bodyObj | ConvertTo-Json -Depth 5)
            $headers["Content-Type"] = "application/json"
        }

        $params = @{
            Uri           = $fullUrl
            Method        = $method
            Headers       = $headers
            UseBasicParsing = $true
            TimeoutSec    = 10
            ErrorAction   = 'Stop'
        }
        if ($bodyJson) {
            $params.Body = $bodyJson
        }

        $response = Invoke-WebRequest @params
        $status   = $response.StatusCode

        # If this is Auth Register and success, extract token
        if ($test.name -eq "Auth Register" -and ($status -eq 201 -or $status -eq 200)) {
            try {
                $json = $response.Content | ConvertFrom-Json
                if ($json.token) {
                    $token = $json.token
                    Write-Host " [Token: $($token.Substring(0, 20))...]" -ForegroundColor Gray -NoNewline
                }
            } catch {}
        }

        # If this is Auth Login and success, extract token
        if ($test.name -eq "Auth Login" -and $status -eq 200) {
            try {
                $json = $response.Content | ConvertFrom-Json
                if ($json.token) {
                    $token = $json.token
                    Write-Host " [Token: $($token.Substring(0, 20))...]" -ForegroundColor Gray -NoNewline
                }
            } catch {}
        }

        if ($status -eq $expect) {
            Write-Host " OK ($status)" -ForegroundColor Green
            $success++
        } else {
            Write-Host " FAIL ($status expected $expect)" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 500 }

        if ($status -eq $expect) {
            Write-Host " OK ($status)" -ForegroundColor Green
            $success++
        } else {
            Write-Host " FAIL ($status expected $expect)" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$percent = [math]::Round(($success / $total) * 100, 1)
Write-Host "Success: $success / $total ($percent`%)"
Write-Host "Failed:  $failed"
Write-Host "=====================`n"
if ($failed -eq 0) {
    Write-Host "🎉 All tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Please review the results above." -ForegroundColor Red
}
# End of test-all.ps1