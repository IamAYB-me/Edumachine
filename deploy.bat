@echo off
echo ========================================
echo   BROCHEST Portal - Firebase Deploy
echo ========================================
echo.

cd /d "C:\Users\US\Desktop\EduMachine"

echo [1/4] Logging out of wrong account...
node "C:\Users\US\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js" logout
echo.

echo [2/4] Logging in to correct Firebase account...
echo A browser will open. Sign in with the Google account 
echo that owns the myskulboot Firebase project.
echo.
node "C:\Users\US\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js" login
if %errorlevel% neq 0 (
    echo LOGIN FAILED!
    pause
    exit /b 1
)
echo LOGIN SUCCESSFUL!
echo.

echo [3/4] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo BUILD FAILED!
    pause
    exit /b 1
)
echo BUILD SUCCESSFUL!
echo.

echo [4/4] Deploying to Firebase Hosting...
node "C:\Users\US\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js" deploy --only hosting
if %errorlevel% neq 0 (
    echo DEPLOY FAILED!
    pause
    exit /b 1
)
echo.
echo ========================================
echo   DEPLOYED SUCCESSFULLY!
echo   Visit: https://www.app.brochest.com.ng
echo ========================================
pause
