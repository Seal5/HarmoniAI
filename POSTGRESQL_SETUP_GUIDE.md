# PostgreSQL Setup Guide for HarmoniAI

This guide will walk you through setting up PostgreSQL on Windows to store PHQ-9 questionnaire data.

## 📋 Prerequisites

- Windows 10/11
- Administrator access
- Internet connection

## 🚀 Method 1: Quick Setup with Installer (Recommended)

### Step 1: Download PostgreSQL

1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download the latest version (16.x recommended)
4. The file will be named something like `postgresql-16.x-x-windows-x64.exe`

### Step 2: Install PostgreSQL

1. **Run the installer as Administrator**
   - Right-click the downloaded file → "Run as administrator"

2. **Follow the installation wizard:**
   - Installation Directory: `C:\Program Files\PostgreSQL\16` (default is fine)
   - Select Components: Keep all selected (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - Data Directory: `C:\Program Files\PostgreSQL\16\data` (default is fine)
   - **Password**: Set a password for the postgres user (remember this!)
   - Port: `5432` (default)
   - Advanced Options: Default locale (default is fine)

3. **Complete installation** (may take 5-10 minutes)

### Step 3: Verify Installation

1. **Open Command Prompt as Administrator**
2. **Test PostgreSQL connection:**
   ```cmd
   psql -U postgres -h localhost -p 5432
   ```
3. **Enter the password** you set during installation
4. **If successful**, you'll see something like:
   ```
   psql (16.x)
   Type "help" for help.
   postgres=#
   ```
5. **Exit psql:**
   ```sql
   \q
   ```

## 🔧 Method 2: Using Package Manager

### Option A: Chocolatey

1. **Install Chocolatey** (if not already installed):
   - Open PowerShell as Administrator
   - Run:
     ```powershell
     Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
     ```

2. **Install PostgreSQL:**
   ```powershell
   choco install postgresql --params '/Password:your_password_here'
   ```

### Option B: winget

```powershell
winget install PostgreSQL.PostgreSQL
```

## 🗄️ Setting Up the HarmoniAI Database

### Step 1: Create Database and User

1. **Open Command Prompt as Administrator**
2. **Connect to PostgreSQL:**
   ```cmd
   psql -U postgres -h localhost -p 5432
   ```
3. **Enter your postgres password**
4. **Create the database:**
   ```sql
   CREATE DATABASE harmonidb;
   ```
5. **Create a user for the application:**
   ```sql
   CREATE USER harmoni WITH PASSWORD 'harmoni123';
   ```
6. **Grant permissions:**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE harmonidb TO harmoni;
   \c harmonidb
   GRANT ALL ON SCHEMA public TO harmoni;
   ```
7. **Exit:**
   ```sql
   \q
   ```

### Step 2: Test the New Database

```cmd
psql -U harmoni -d harmonidb -h localhost -p 5432
```
Enter password: `harmoni123`

If successful, you should see:
```
psql (16.x)
Type "help" for help.
harmonidb=>
```

## ⚙️ Configure HarmoniAI Application

### Step 1: Update Environment Variables

Make sure your `.env.local` file contains:

```env
# PostgreSQL Configuration
DATABASE_URL="postgresql://harmoni:harmoni123@localhost:5432/harmonidb?schema=public"
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=harmonidb
POSTGRES_USER=harmoni
POSTGRES_PASSWORD=harmoni123

# Gemini AI API Key (your existing key)
GEMINI_API_KEY=AIzaSyDF1_qcUmBR5nmfdFL3l4Q_RmXTlhdEm3Y

# Redis (disabled to prevent connection errors)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=development
```

### Step 2: Install Dependencies and Setup Database

1. **Open PowerShell in your project directory:**
   ```powershell
   cd "C:\Users\yashs\OneDrive\Documents\GitHub\HarmoniAI"
   ```

2. **Install Prisma CLI (if not already installed):**
   ```powershell
   npm install prisma --save-dev
   ```

3. **Generate Prisma Client:**
   ```powershell
   npx prisma generate
   ```

4. **Push the database schema:**
   ```powershell
   npx prisma db push
   ```

   You should see output like:
   ```
   Environment variables loaded from .env.local
   Prisma schema loaded from prisma\schema.prisma

   🚀  Your database is now in sync with your schema.
   
   ✔ Generated Prisma Client (v6.x.x) to .\node_modules\@prisma\client
   ```

### Step 3: Test the Application

1. **Start the development server:**
   ```powershell
   npm run dev
   ```

2. **Open your browser** and go to: http://localhost:3001

3. **Test the flow:**
   - Visit home page
   - Click "Get Started" 
   - Sign up with a new account
   - Complete the PHQ-9 questionnaire
   - Verify data is stored in database

## 🔍 Verify Database Setup

### Using pgAdmin (GUI)

1. **Open pgAdmin 4** (installed with PostgreSQL)
2. **Add server:**
   - Name: HarmoniAI Local
   - Host: localhost
   - Port: 5432
   - Database: harmonidb
   - Username: harmoni
   - Password: harmoni123
3. **Browse to see your tables** after running the application

### Using Command Line

```cmd
psql -U harmoni -d harmonidb -h localhost -p 5432

-- View all tables
\dt

-- View PHQ-9 responses
SELECT * FROM phq9_responses;

-- View users
SELECT * FROM users;

-- Exit
\q
```

## 🛠️ Troubleshooting

### Issue: "psql: command not found"

**Solution:** Add PostgreSQL to your PATH:
1. Open System Properties → Advanced → Environment Variables
2. Edit PATH and add: `C:\Program Files\PostgreSQL\16\bin`
3. Restart Command Prompt

### Issue: "connection refused"

**Solutions:**
1. **Check if PostgreSQL is running:**
   ```powershell
   Get-Service postgresql*
   ```

2. **Start PostgreSQL service:**
   ```powershell
   Start-Service postgresql-x64-16
   ```

3. **Check the port:** Make sure PostgreSQL is running on port 5432

### Issue: "authentication failed"

**Solutions:**
1. **Double-check your password**
2. **Reset postgres password:**
   ```cmd
   # Stop PostgreSQL service first
   net stop postgresql-x64-16
   
   # Start in single-user mode (advanced - contact if needed)
   ```

### Issue: Prisma connection errors

1. **Verify your DATABASE_URL** in `.env.local`
2. **Test connection manually:**
   ```powershell
   npx prisma db pull
   ```
3. **Check that harmonidb exists and harmoni user has permissions**

## 🎉 Success Indicators

You'll know everything is working when:

✅ **PostgreSQL service is running**
✅ **You can connect with psql**
✅ **Prisma generates without errors**
✅ **Application starts without database errors**
✅ **Quiz submissions save to database**
✅ **You can see data in pgAdmin or psql**

## 🔐 Security Notes

### For Development:
- The credentials (`harmoni/harmoni123`) are fine for local development
- Make sure PostgreSQL is not accessible from outside your machine

### For Production:
- Use strong passwords
- Enable SSL connections
- Set up proper firewall rules
- Use environment variables for credentials
- Consider managed database services (AWS RDS, Azure Database, etc.)

## 📞 Need Help?

If you encounter issues:

1. **Check the error messages** in the terminal
2. **Verify all environment variables** are correct
3. **Test database connection** manually with psql
4. **Check PostgreSQL logs** in: `C:\Program Files\PostgreSQL\16\data\log\`

The most common issue is authentication - make sure your passwords and usernames match exactly what you set during installation.

---

**Your HarmoniAI application should now have a fully functional PostgreSQL database!** 🎊

Users can now sign up, complete the PHQ-9 questionnaire, and their responses will be securely stored in your PostgreSQL database with proper scoring and risk assessment.
