# ESG Data Inventory System - Setup Script
# Run this script to set up the entire project

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ESG Data Inventory System - Setup Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL installation
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "✓ PostgreSQL service found: $($pgService.Name)" -ForegroundColor Green
    
    # Start PostgreSQL if not running
    if ($pgService.Status -ne 'Running') {
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service $pgService.Name
        Write-Host "✓ PostgreSQL started" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ PostgreSQL service not found. Please ensure PostgreSQL is installed." -ForegroundColor Yellow
    Write-Host "  Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Installing Backend Dependencies" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

Set-Location backend
Write-Host "Installing backend packages..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Edit backend/.env and set your PostgreSQL credentials!" -ForegroundColor Yellow
    Write-Host "  DATABASE_URL='postgresql://username:password@localhost:5432/esg_inventory'" -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Press Enter after updating .env file, or type 'skip' to continue anyway"
    if ($continue -eq 'skip') {
        Write-Host "⚠ Continuing with default .env settings..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "✗ Prisma generation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "✗ Database migration failed. Check your DATABASE_URL in .env" -ForegroundColor Red
    Write-Host "  Make sure PostgreSQL is running and credentials are correct" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
$seedData = Read-Host "Load sample data? (y/n)"
if ($seedData -eq 'y' -or $seedData -eq 'Y') {
    Write-Host "Loading sample data..." -ForegroundColor Yellow
    
    # Get DB connection details from .env
    $envContent = Get-Content .env | Where-Object { $_ -match 'DATABASE_URL' }
    $dbUrl = $envContent -replace 'DATABASE_URL=["'']?(.*)["'']?', '$1'
    
    # Parse connection string
    if ($dbUrl -match 'postgresql://(.+):(.+)@(.+):(\d+)/(.+)\?') {
        $dbUser = $matches[1]
        $dbPassword = $matches[2]
        $dbHost = $matches[3]
        $dbPort = $matches[4]
        $dbName = $matches[5]
        
        $env:PGPASSWORD = $dbPassword
        psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -f prisma/seed.sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Sample data loaded" -ForegroundColor Green
        } else {
            Write-Host "⚠ Failed to load sample data. You can load it manually later." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Could not parse DATABASE_URL. Load sample data manually with:" -ForegroundColor Yellow
        Write-Host "  psql -U postgres -d esg_inventory -f prisma/seed.sql" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Installing Frontend Dependencies" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

Set-Location ../frontend
Write-Host "Installing frontend packages..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Option 1 - Start both (requires concurrently):" -ForegroundColor White
Write-Host "    npm install" -ForegroundColor Cyan
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Option 2 - Start separately:" -ForegroundColor White
Write-Host "    Terminal 1: cd backend && npm run dev" -ForegroundColor Cyan
Write-Host "    Terminal 2: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  cd backend && npx prisma studio  # Open database GUI" -ForegroundColor White
Write-Host "  cd backend && npm run dev        # Start backend only" -ForegroundColor White
Write-Host "  cd frontend && npm run dev       # Start frontend only" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  README.md           - Full documentation" -ForegroundColor White
Write-Host "  QUICKSTART.md       - Quick start guide" -ForegroundColor White
Write-Host "  API_DOCUMENTATION.md - API reference" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
