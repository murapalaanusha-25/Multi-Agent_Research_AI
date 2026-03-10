# ResearchAI — Complete Setup Guide
# Python 3.11.9 · Node 20.19.6 · npm 10.8.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 1 — GET FREE API KEYS (5 minutes total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GROQ (AI engine — free):
   → Visit: https://console.groq.com
   → Sign up → API Keys → Create Key
   → Copy: gsk_xxxxxxxxxxxx

2. TAVILY SEARCH (web search — free, optional):
   → Visit: https://tavily.com
   → Sign up → Dashboard → API Key
   → Copy: tvly-xxxxxxxxxxxx

3. MONGODB (database — choose one option below):

   OPTION A — Local (recommended for development):
   → Download: https://www.mongodb.com/try/download/community
   → Install and start the MongoDB service
   → No account needed
   → Connection string: mongodb://localhost:27017
   → Optionally install MongoDB Compass to browse data visually:
     https://www.mongodb.com/try/download/compass

   OPTION B — MongoDB Atlas (free cloud):
   → Visit: https://cloud.mongodb.com
   → Sign up → Create FREE M0 cluster
   → Database Access → Add user → password auth
   → Network Access → Allow from anywhere (0.0.0.0/0)
   → Connect → Drivers → Copy connection string
   → Replace <password> with your password
   → Example: mongodb+srv://username:password@cluster0.abc12.mongodb.net/

4. GMAIL SMTP (for password reset emails):
   → Google Account → Security → App Passwords
   → Create password for "Mail" on your device
   → Copy the 16-character password (xxxx xxxx xxxx xxxx)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 2 — MONGODB COMPASS (optional, to browse data)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open MongoDB Compass
2. Click "New Connection"
3. Enter your connection string:
   Local:  mongodb://localhost:27017
   Atlas:  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
4. Click Connect

After running the app, you will see these collections:
   researchai
   ├── users                     ← signup/login accounts
   ├── research_reports          ← all generated reports
   ├── chat_sessions             ← chat history
   ├── password_reset_tokens     ← for forgot password
   └── email_verification_tokens ← for email verify

You can:
  • Browse documents → click any collection
  • Filter → { "user_id": "xxx" }
  • Delete test data → right click document → Delete


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 3 — BACKEND SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open Terminal 1 (PowerShell or CMD):

  cd researchai

  # Create virtual environment (in root folder, not inside backend)
  py -3.11 -m venv venv
          or
  python -m venv venv

  # Activate it
  venv\Scripts\activate

  # Upgrade pip
  py -m pip install --upgrade pip

  # Install dependencies
  cd backend
  pip install -r requirements.txt

  # Create your .env file inside backend\
  copy .env.example .env
  # Then open .env and fill in your keys (see Step 4)

  # Start backend (from inside backend\ folder)
  py -m uvicorn main:app --reload --port 8000

  You should see:
     MongoDB connected — database: researchai
     Uvicorn running on http://127.0.0.1:8000


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 4 — .env FILE (backend\.env)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fill in backend\.env with your keys:

  # Local MongoDB (Option A)
  MONGODB_URL=mongodb://localhost:27017

  # OR Atlas MongoDB (Option B)
  MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/

  DATABASE_NAME=researchai
  SECRET_KEY=any-random-string-at-least-32-characters-long
  GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
  TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxx
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=youremail@gmail.com
  SMTP_PASSWORD=xxxx xxxx xxxx xxxx
  FRONTEND_URL=http://localhost:3000

  Note: TAVILY_API_KEY is optional — falls back to LLM if not set.
  Note: SMTP keys are only needed for password reset emails.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 5 — FRONTEND SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open Terminal 2 (new PowerShell or CMD):

  cd frontend

  npm install

  npm run dev

  Open browser: http://localhost:3000


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 6 — USE THE APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open http://localhost:3000
2. Click "Create Account" → fill name, email, password → submit
3. You are now logged in!

RESEARCH TAB:
  → Type any topic (e.g. "Quantum Computing")
  → Click Generate
  → Watch 4 agents run with live terminal log
  → Read the 7-section report
  → Download as PDF

CHAT TAB:
  → Ask anything — real Groq AI responds
  → Sessions auto-saved to MongoDB
  → Rename or delete chats from the sidebar

HISTORY TAB:
  → All reports listed with word count and date
  → Click any report to re-read
  → Download PDF or delete

PROFILE TAB:
  → Edit name/email
  → Change password

FORGOT PASSWORD:
  → Click "Forgot password?" on login screen
  → Enter your email → Send Reset Link
  → Check inbox → click the button in the email
  → Opens localhost:3000/reset-password (app must be running)
  → Enter new password → done


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERROR: pip not recognized
  → Use: py -m pip install ...

ERROR: uvicorn not found
  → Make sure venv is activated (venv\Scripts\activate)
  → Use: py -m uvicorn main:app --reload --port 8000

ERROR: MongoDB connection failed (Local)
  → Make sure MongoDB service is running
  → Windows: Services → MongoDB → Start
         or: net start MongoDB  (in CMD as admin)

ERROR: MongoDB connection failed (Atlas)
  → Check your MONGODB_URL in backend\.env
  → Make sure 0.0.0.0/0 is in Atlas Network Access
  → Check username/password in connection string

ERROR: CORS error in browser
  → Make sure backend is running on port 8000
  → Make sure frontend is running on port 3000

ERROR: 401 Unauthorized
  → Log out and log back in to refresh your token

ERROR: Groq rate limit
  → Free tier: 6000 tokens/min, 30 req/min
  → Wait 60 seconds and try again
  → The app will auto-fallback to a slower model

ERROR: Reset email not received
  → Check spam folder
  → Verify SMTP_USER and SMTP_PASSWORD in .env
  → SMTP_PASSWORD must be a Gmail App Password (16 chars),
    not your regular Gmail password


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 API ENDPOINTS REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Docs: http://localhost:8000/docs

POST   /auth/signup
POST   /auth/login
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password

POST   /research/generate       ← main pipeline (~20-40s)
GET    /research/history
GET    /research/{id}
GET    /research/{id}/download  ← PDF download
DELETE /research/{id}

POST   /chat/message
GET    /chat/sessions
GET    /chat/session/{id}
DELETE /chat/session/{id}

GET    /user/profile
PUT    /user/update
POST   /user/change-password
DELETE /user/delete