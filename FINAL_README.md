# ACIA (Autonomous Career Intelligence Advisor) - Final Setup & Deployment

## 📁 Project Structure
lovable-ui-builder/
├── back-end/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── interview.js
│   │   ├── placement.js
│   │   ├── roadmap.js
│   │   ├── resume.js
│   │   └── skills.js
│   ├── supabase/
│   │   └── schema.sql
│   ├── server.js
│   └── package.json
├── frent-end/
│   ├── src/
│   │   ├── components/dashboard/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── Auth.tsx
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx
│   └── package.json
├── vercel.json
└── README.md

## 🚀 Getting Started

### 1. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Create a new project.
3. Open the **SQL Editor** and run the contents of `back-end/supabase/schema.sql`.
4. Enable **Storage** and create a bucket named `resumes` (set it to public or configure RLS).

### 2. Environment Variables
Create `.env` files in both folders based on the `.env.example` files provided.

**Backend (.env):**
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Your anon/public key
- `JWT_SECRET`: A random secure string
- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: Your Gmail App Password

**Frontend (.env):**
- `VITE_SUPABASE_URL`: Same as backend
- `VITE_SUPABASE_ANON_KEY`: Same as backend
- `VITE_API_URL`: `/api` (for production) or `http://localhost:5000/api` (for local)

### 3. Installation & Running
```bash
# Install backend dependencies
cd back-end
npm install
npm start

# Install frontend dependencies
cd ../frent-end
npm install
npm run dev
```

## ☁️ Deployment (Vercel)
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect the `vercel.json` and deploy both the frontend and backend.
4. Ensure you set the Environment Variables in the Vercel dashboard.

## 🛠 Features Implemented
- **AI Career Advisor**: Personalized roadmaps and skill analysis.
- **Resume Intelligence**: Automated skill extraction from PDF/DOCX.
- **Mock Interviews**: Curated questions for target roles.
- **Placement Predictor**: Readiness score based on profile.
- **Secure Auth**: OTP-verified login and Supabase Auth integration.
