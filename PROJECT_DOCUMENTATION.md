# PROJECT DOCUMENTATION: ACIA (Autonomous Career Intelligence Advisor)

## 1. Project Overview
**ACIA** is a cutting-edge, AI-powered career development platform designed to bridge the gap between students/job seekers and their professional goals. By leveraging Large Language Models (LLMs) and data-driven analysis, ACIA provides a personalized, autonomous guidance system that evolves with the user's progress.

## 2. Core Vision
To empower every student with "Intelligence-grade" career advice that was previously only available through expensive one-on-one coaching, making career success predictable and accessible.

## 3. Key Features

### 📄 Resume Intelligence
- **Deep Extraction**: AI analysis of resumes to identify core competencies, hidden strengths, and project impact.
- **ATS Optimization**: Suggestions to improve resume visibility for automated tracking systems.

### 🎯 Skill Gap Analysis
- **Target Mapping**: Compares current user skills against specific industry job roles (e.g., Full Stack Dev, Data Scientist).
- **Competency Heatmaps**: Visual representation of "Ready" vs "Learning Required" skills.

### 📈 Placement Prediction
- **Probability Modeling**: ML-driven assessment (simulated) of a user's readiness for upcoming campus or off-campus placements.
- **Risk Identification**: Highlights factors that might be lowering the user's conversion chances.

### 🗺️ Adaptive Learning Roadmaps
- **Personalized Paths**: Generates dynamic roadmap steps (Courses, Projects, Certifications) to fill identified skill gaps.
- **Resource Curating**: Links to specific learning resources (YouTube, Coursera, Documentation) for each step.

### 💬 AI Interview preparation
- **Role-Specific Mocking**: Generates technical and HR questions based on the user's targeted career path.
- **Response Evaluation**: Provides feedback on sample answers to improve communication and technical depth.

---

## 4. Technical Architecture

### Frontend (User Interface)
- **Framework**: React 18 with Vite.
- **Language**: TypeScript for type-safe development.
- **Styling**: Tailwind CSS for responsive, utility-first design.
- **UI Components**: Shadcn UI (Radix UI primitives) for high-quality, accessible components.
- **State & Data**: Tanstack Query (React Query) for efficient server-state management.
- **Animations**: Framer Motion for premium, smooth micro-interactions.

### Backend (Logic & Services)
- **Runtime**: Node.js with Express.js.
- **Database**: Supabase (PostgreSQL) for user data and persistent storage.
- **Authentication**: Supabase Auth (Supporting Google/GitHub OAuth and Secure Email/Password).
- **Email System**: Nodemailer integration via a dedicated Node server for OTP and notification dispatch.

---

## 5. Security & Infrastructure
- **Secure Auth**: Industry-standard OAuth 2.0 and JWT-based session management.
- **OTP Verification**: Multi-factor authentication layer for critical actions.
- **Environment Safety**: All sensitive credentials (API keys, SMTP passwords) are managed via `.env` files and never exposed to the client.
- **Deployment**: Configured for Vercel/Netlify with optimized build pipelines and routing.

## 6. Project Directory Structure
```text
/
├── back-end/          # Node.js API (OTP & Email Services)
│   ├── server.js      # Main Express Entry point
│   └── package.json   # Backend dependencies
├── frent-end/         # React Frontend UI
│   ├── src/           # Component & Page logic
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── vercel.json        # Deployment configuration
└── index.css          # Design system & Theme variables
```

---

## 7. Future Roadmap
- **Real-time Job Matching**: Integration with job boards to match users with real openings.
- **Live Interview Simulation**: Video-based AI mock interviews with sentiment analysis.
- **Peer Comparison**: Anonymous benchmarking against other users in the same field.
- **Mentorship Integration**: Connecting high-scoring users with industry professionals.
