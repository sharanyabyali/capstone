# EduMentor AI: A Multi-Agent Personalized Learning Assistant

> EduMentor AI is a glassmorphic multi-agent learning platform featuring a Study Planner Agent for custom roadmaps, Socratic Tutor chat, Quiz evaluations, and a Pomodoro Focus Sanctuary with synthesized ambient binaural/rain soundscapes. Integrates live Gemini models and supports automated CI/CD static deployments to GitHub Pages.

---

## 🌟 Key Features

### 1. Specialized Multi-Agent Framework
- **Study Planner Agent (Curriculum Planner):** Analyzes the target subject, learner proficiency (Beginner, Intermediate, Advanced), and learning style (Practical, Theoretical, Visual) to compile structured modules and lesson pathways.
- **Tutor Agent (Socratic Mentor):** An embedded chat tutor that guides understanding through leading questions, prompts, and thought validation. It strictly avoids feeding direct solutions.
- **Quiz Agent (Assessment & Feedback):** Sets interactive multiple-choice tests per lesson and provides analytical, conceptual breakdown evaluations of the options.
- **Progress Agent (Progress Tracker):** Tracks masteries, streak calendars, study metrics, and unlocks gamified achievements.
- **Resource Agent:** Automatically fetches recommended additional references, articles, and video resources matching the active lesson context.

### 2. Gamified Quests & XP Leveling
- Earn XP for active lessons, Socratic chats, completed quizzes, and focus sessions.
- Vibrant, animated Level Up cards celebrate progress landmarks.
- Dynamic daily challenges tracking targets.

### 3. Spaced-Repetition Leitner Flashcards
- Card decks generated dynamically from lessons completed by the student.
- Beautiful 3D flip card animations showing the concept question and explanation.
- Recalls are scored to rearrange card frequencies optimizing memorization retention.

### 4. Focus Sanctuary & Ambient Synthesizer
- Concentric Pomodoro timers mapping study and short-break periods.
- High-fidelity Web Audio API synth soundscapes providing zero-asset binaural beats, storm rain noise, and brownian pink noise straight from the browser context (no downloads required).

### 5. Text-To-Speech (TTS) Reader
- Listen to Socratic responses and summaries using natural Speech Synthesis options, facilitating auditory learners.

---

## 📸 Screenshots

To showcase the high-fidelity user interface, place screenshots in a `docs/assets/` folder and link them below:

| AI Dashboard | Study Planner Agent |
| :---: | :---: |
| ![AI Dashboard Placeholder](https://raw.githubusercontent.com/sharanyabyali/capstone/main/docs/assets/dashboard.png) | ![Study Planner Placeholder](https://raw.githubusercontent.com/sharanyabyali/capstone/main/docs/assets/planner.png) |

| Tutor Agent | Focus Sanctuary |
| :---: | :---: |
| ![Tutor Agent Socratic Chat Placeholder](https://raw.githubusercontent.com/sharanyabyali/capstone/main/docs/assets/tutor.png) | ![Focus Sanctuary Placeholder](https://raw.githubusercontent.com/sharanyabyali/capstone/main/docs/assets/focus.png) |

---

## ⚙️ CI/CD Deployment Workflow

The repository includes a GitHub Actions CI/CD workflow defined in `.github/workflows/deploy.yml` which deploys the static application directly to **GitHub Pages** on every push to the `main` branch.

### Git Flow & Deployment Diagram:
```mermaid
graph TD
    Developer[Developer Push to Main] -->|Push Code| Github[GitHub Repository]
    Github -->|Triggers| GA[GitHub Actions Runner]
    GA -->|Step 1: Checkout| Checkout[checkout@v4]
    Checkout -->|Step 2: Setup Pages| Setup[configure-pages@v4]
    Setup -->|Step 3: Upload Artifacts| Upload[upload-pages-artifact@v3]
    Upload -->|Step 4: Deploy| Deploy[deploy-pages@v4]
    Deploy -->|Published Link| LiveSite[Live GitHub Pages Site]
```

---

## 🚀 Getting Started

### 1. Launch the Application Locally
Because this project uses browser modules and local storage, you should run it behind a lightweight HTTP server. 

You can run one of the following commands in the project directory:

**Using Python:**
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

**Using Node (npx):**
```bash
npx serve
```
Then visit the URL displayed (usually `http://localhost:3000` or `5000`).

### 2. Configure Live AI (Optional)
To connect the application directly to live Gemini generation:
1. Obtain an API Key from [Google AI Studio](https://aistudio.google.com/).
2. Navigate to the **Settings** panel in the app sidebar.
3. Input your key and click **Save Configuration**.
4. The Planner, Socratic Chat, and Quiz agents will now execute live generations custom to any topic you supply.
5. If no key is configured, the app will seamlessly run its built-in offline simulation databases for *Introduction to Python*, *Machine Learning Basics*, *Quantum Computing*, and *World History (The Silk Road)*.
