# ACIA - Autonomous Career Intelligence Advisor 🚀

Welcome to **ACIA**, an intelligent and autonomous career advisor built to evaluate candidate profiles, detect skill gaps, predict placement probability, and provide personalized career roadmaps powered by AI.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 🌟 Key Features
- **Intelligent Career Advice**: Upload a resume to get AI-driven insights on skill gaps and placement probabilities.
- **Dark/Light Mode**: Full responsive UI with stunning animations powered by Shadcn UI and Tailwind CSS.
- **Authentication**: Secure Google OAuth, GitHub OAuth, and traditional Email sign-ups supported securely by Supabase.
- **Email OTPs**: A dedicated Node.js backend using Nodemailer to dispatch authentication codes.
- **Interactive Dashboard**: Modern interactive career roadmaps and charts tailored specifically to the user's progress.

---

## 🏗️ Project Architecture
The project is split cleanly into a `frent-end` UI app and a Node.js `back-end` API. 

```bash
📦 ACIA
 ┣ 📂 back-end             # Node.js + Express API Backend Server
 ┃ ┣ 📜 server.js          # Core Express application and Nodemailer routes
 ┃ ┗ 📜 .env               # Backend environment variables
 ┣ 📂 frent-end            # Vite + React Frontend Application
 ┃ ┣ 📂 src                # UI Components, Pages, and Styles
 ┃ ┃ ┣ 📂 components       # Reusable components (Shadcn + Custom)
 ┃ ┃ ┣ 📂 pages            # Landing Page, Dashboard, Auth pages
 ┃ ┃ ┗ 📜 index.css        # Core design variables (Dark Mode support)
 ┃ ┣ 📜 package.json       
 ┃ ┗ 📜 vite.config.ts     
 ┗ 📜 README.md          
```

---

## 🛠️ Local Development Setup

### 1. Requirements
- **Node.js**: v18 or newer installed locally ([Install here](https://nodejs.org/)).
- **Git** version control.

### 2. Frontend Setup (React/Vite)
Open your terminal and run the following commands to install dependencies and start the UI:

```bash
cd frent-end
npm install
npm run dev
```
The frontend will spin up and become accessible at `http://localhost:8080`.

### 3. Backend Setup (OTP Server)
Open a **new terminal tab** and run the following commands to deploy the Node server:

```bash
cd back-end
npm install
```

Before running, make sure to add an App Password from your Google Account to a local `.env` file inside the `back-end/` directory:
```env
PORT=5000
EMAIL_USER=your_real_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

Then start the server:
```bash
npm start
```
The API will become accessible at `http://localhost:5000`.

---

## 🚀 Deployment (Vercel)

This repository is optimized for **Vercel** with a pre-configured `vercel.json` file.
1. Connect this GitHub repository on your [Vercel Dashboard](https://vercel.com/dashboard).
2. Set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `frent-end` from within the Vercel Settings panel to ensure the build pipeline runs perfectly!

---

## 🤝 Contributing
Feel free to fork this repository, create a new branch containing your improvements, and open a Pull Request! Ensure all ESLint rules pass and `npm run build` executes without errors before requesting a review.