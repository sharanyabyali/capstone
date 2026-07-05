/**
 * EduMentor AI Client Application Controller
 * Manages view routing, local storage persistence, state syncing, Socratic chat bubbles,
 * Leitner spaced repetition flashcards, XP/quest systems, and Web Audio synthesizers.
 */

class EduMentorApp {
  constructor() {
    this.engine = new window.AgentEngine();
    
    // Core App State
    this.state = {
      xp: 0,
      level: 1,
      streak: 3,
      apiKey: "",
      activeCourses: [],
      activeCourseId: null,
      activeLessonId: null,
      chatHistories: {}, // { lessonId: [ {sender: 'mentor'|'student', text: string} ] }
      flashcardsReviewed: {}, // { lessonId: [ {question, answer, interval, box} ] }
      quests: [
        { id: "q-create", text: "Compose a Custom Roadmap", reward: 25, completed: false },
        { id: "q-socratic", text: "Initiate Socratic Dialogue", reward: 15, completed: false },
        { id: "q-quiz", text: "Complete a Quiz Arena Test", reward: 30, completed: false },
        { id: "q-focus", text: "Focus Sanctuary Session", reward: 20, completed: false }
      ],
      completedLessons: [], // list of lessonIds completed
      agentActivities: [
        { agent: "Planner Agent", message: "generated today's roadmap", timestamp: "12:00 PM" },
        { agent: "Tutor Agent", message: "explained Dynamic Programming", timestamp: "12:05 PM" },
        { agent: "Quiz Agent", message: "prepared 10 MCQs", timestamp: "12:10 PM" },
        { agent: "Progress Agent", message: "updated mastery", timestamp: "12:15 PM" },
        { agent: "Resource Agent", message: "found 3 videos", timestamp: "12:20 PM" }
      ]
    };

    // UI View Track
    this.activeView = "dashboard";

    // Audio State (Web Audio API Synthesizers)
    this.audioCtx = null;
    this.ambientNodes = [];
    this.activeAmbientSound = "none";

    // Pomodoro Timer State
    this.pomodoro = {
      minutes: 25,
      seconds: 0,
      timerId: null,
      isRunning: false,
      mode: "focus" // focus or break
    };

    // Quiz State
    this.quiz = {
      lessonId: null,
      questions: [],
      currentQuestionIndex: 0,
      answersSubmitted: [], // { questionId, selectedIndex, isCorrect }
      isExplanationVisible: false
    };

    // Flashcard State
    this.flashcards = {
      lessonId: null,
      cards: [],
      currentIndex: 0
    };
  }

  init() {
    this.loadState();
    this.setupViewListeners();
    this.renderQuests();
    this.renderActiveCourses();
    this.syncXPWidgets();
    this.initializeMouseGlow();
    this.renderAgentActivities();
    
    // Set API Key input value in Settings panel
    const keyInput = document.getElementById("settings-api-key");
    if (keyInput) {
      keyInput.value = this.state.apiKey;
    }
  }

  // Load and save state using LocalStorage
  loadState() {
    const saved = localStorage.getItem("edumentor_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge config to prevent missing structures
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error("Failed to parse local storage data:", e);
      }
    }
  }

  saveState() {
    localStorage.setItem("edumentor_state", JSON.stringify(this.state));
  }

  // View Navigation Router
  switchView(viewId) {
    // Dismiss active views
    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.remove("active");
    });
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
    });

    // Activate selected view
    const panel = document.getElementById(`view-${viewId}`);
    if (panel) {
      panel.classList.add("active");
    }

    const nav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (nav) {
      nav.classList.add("active");
    }

    this.activeView = viewId;
    
    // Custom views initializing hooks
    if (viewId === "dashboard") {
      this.renderActiveCourses();
      this.renderQuests();
    } else if (viewId === "chat") {
      this.loadSocraticMentorDirectPanel();
    } else if (viewId === "flashcards") {
      this.loadFlashcardDeckSelection();
    }
  }

  setupViewListeners() {
    // Bind click events on sidebar items
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        this.switchView(view);
      });
    });

    // Handle interactive planner form styles
    this.setupSelectorGrid("planner-level");
    this.setupSelectorGrid("planner-style");

    // Dynamic key listeners for chat entries
    const chatInput = document.getElementById("reader-chat-input");
    if (chatInput) {
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.sendSocraticMessage();
      });
    }
  }

  setupSelectorGrid(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const options = grid.querySelectorAll(".selector-option");
    options.forEach(opt => {
      opt.addEventListener("click", () => {
        options.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
  }

  // Visual card gradient hover glows
  initializeMouseGlow() {
    document.addEventListener("mousemove", (e) => {
      document.querySelectorAll(".glass-card").forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
      });
    });
  }

  // Save Settings API Keys
  saveApiKey() {
    const key = document.getElementById("settings-api-key").value.trim();
    this.state.apiKey = key;
    this.saveState();
    alert("Configuration key saved successfully! Live Gemini models activated.");
    this.switchView("dashboard");
  }

  /**
   * gamification: XP level systems, Badge cabinet and Quests
   */
  gainXP(amount) {
    this.state.xp += amount;
    
    // Check level up (100 XP per level)
    const threshold = this.state.level * 100;
    if (this.state.xp >= threshold) {
      this.state.xp -= threshold;
      this.state.level += 1;
      this.triggerLevelUpCelebration(this.state.level);
    }
    
    this.saveState();
    this.syncXPWidgets();
  }

  triggerLevelUpCelebration(newLvl) {
    const overlay = document.getElementById("lvl-up-celeb-overlay");
    const label = document.getElementById("lvl-up-display-value");
    if (overlay && label) {
      label.innerText = `Level ${newLvl}`;
      overlay.classList.add("active");
    }
  }

  dismissLevelUp() {
    const overlay = document.getElementById("lvl-up-celeb-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  syncXPWidgets() {
    const xpText = document.getElementById("widget-xp-text");
    const xpFill = document.getElementById("widget-xp-fill");
    const lvlText = document.getElementById("widget-level");
    const statsXp = document.getElementById("stats-xp-value");
    const statsLessons = document.getElementById("stats-lessons-value");
    const statsAccuracy = document.getElementById("stats-accuracy-value");
    
    const reqXP = this.state.level * 100;
    const progressPct = (this.state.xp / reqXP) * 100;

    if (xpText) xpText.innerText = `${this.state.xp} / ${reqXP} XP`;
    if (xpFill) xpFill.style.width = `${progressPct}%`;
    if (lvlText) lvlText.innerText = `Lv ${this.state.level}`;
    
    // Update analytics page cards
    if (statsXp) statsXp.innerText = (this.state.level - 1) * 100 + this.state.xp;
    if (statsLessons) statsLessons.innerText = this.state.completedLessons.length;
    
    // Calculate accuracy percentage
    if (statsAccuracy) {
      const activeQuizzes = this.state.activeCourses.flatMap(c => 
        c.modules.flatMap(m => m.lessons.flatMap(l => l.quiz || []))
      );
      if (this.state.completedLessons.length > 0) {
        statsAccuracy.innerText = "85%"; // Mocked aggregate assessment metrics
      } else {
        statsAccuracy.innerText = "0%";
      }
    }

    // Handle Badge Cabinet awards in Analytics
    this.syncBadges();
  }

  syncBadges() {
    const badgePioneer = document.getElementById("badge-pioneer");
    const badgeSocrates = document.getElementById("badge-socrates");
    const badgeAcademic = document.getElementById("badge-academic");
    const badgeFocus = document.getElementById("badge-focus");
    
    // Award 1: Pioneer (has courses)
    if (this.state.activeCourses.length > 0 && badgePioneer) {
      badgePioneer.classList.add("unlocked");
    }

    // Award 2: Socrates Pupil (engages in chat history)
    let maxChatHistory = 0;
    Object.values(this.state.chatHistories).forEach(hist => {
      maxChatHistory = Math.max(maxChatHistory, hist.length);
    });
    if (maxChatHistory > 4 && badgeSocrates) {
      badgeSocrates.classList.add("unlocked");
    }

    // Award 3: Academic (completed lessons)
    if (this.state.completedLessons.length > 0 && badgeAcademic) {
      badgeAcademic.classList.add("unlocked");
    }
  }

  triggerQuestCompletion(questId) {
    const quest = this.state.quests.find(q => q.id === questId);
    if (quest && !quest.completed) {
      quest.completed = true;
      this.gainXP(quest.reward);
      this.renderQuests();
      this.saveState();
      
      // Floating visual toast notification
      this.showToast(`Quest Completed: ${quest.text} (+${quest.reward} XP)`);
    }
  }

  renderQuests() {
    const list = document.getElementById("quest-list-container");
    if (!list) return;
    
    list.innerHTML = "";
    this.state.quests.forEach(q => {
      const div = document.createElement("div");
      div.className = `quest-item ${q.completed ? 'completed' : ''}`;
      div.innerHTML = `
        <div class="quest-checkbox">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        </div>
        <span class="quest-text">${q.text}</span>
        <span class="quest-reward">+${q.reward} XP</span>
      `;
      list.appendChild(div);
    });
  }

  showToast(text) {
    const toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.right = "24px";
    toast.style.background = "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))";
    toast.style.color = "white";
    toast.style.padding = "14px 20px";
    toast.style.borderRadius = "12px";
    toast.style.boxShadow = "0 8px 30px rgba(6, 182, 212, 0.3)";
    toast.style.fontSize = "0.85rem";
    toast.style.fontWeight = "700";
    toast.style.zIndex = "2000";
    toast.style.animation = "fadeInUp 0.3s forwards";
    toast.innerText = text;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "fadeOut 0.3s forwards";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  logAgentActivity(agent, message) {
    if (!this.state.agentActivities) {
      this.state.agentActivities = [];
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.state.agentActivities.unshift({
      agent: agent,
      message: message,
      timestamp: timeStr
    });
    if (this.state.agentActivities.length > 5) {
      this.state.agentActivities.pop();
    }
    this.saveState();
    this.renderAgentActivities();
  }

  renderAgentActivities() {
    const container = document.getElementById("agent-activity-container");
    if (!container) return;
    container.innerHTML = "";
    
    const activities = this.state.agentActivities || [];
    activities.forEach(act => {
      const div = document.createElement("div");
      div.className = "quest-item";
      div.innerHTML = `
        <div class="quest-checkbox" style="background: var(--accent-emerald); border-color: var(--accent-emerald); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center;">
          <svg fill="none" stroke="#000" stroke-width="3" style="display:block; width:12px; height:12px;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <span class="quest-text"><strong>${act.agent}</strong> ${act.message}</span>
        <span class="quest-reward" style="background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 0.7rem; font-weight: normal; margin-left: auto; white-space: nowrap;">${act.timestamp}</span>
      `;
      container.appendChild(div);
    });
  }

  /**
   * CURRICULUM GENERATOR CONTROL
   */
  async generateCustomCurriculum() {
    const topic = document.getElementById("planner-topic").value.trim();
    if (!topic) {
      alert("Please enter a topic goals target.");
      return;
    }

    const btn = document.getElementById("generate-roadmap-btn");
    btn.disabled = true;
    btn.innerText = "Planner Agent Composing...";

    // Extract selected selector nodes
    const level = document.querySelector("#planner-level .selector-option.selected").getAttribute("data-value");
    const style = document.querySelector("#planner-style .selector-option.selected").getAttribute("data-value");

    try {
      const course = await this.engine.generateCurriculum(topic, level, style, this.state.apiKey);
      
      // Inject unique Id
      course.id = `course-${Date.now()}`;
      course.progress = 0;

      // Add to courses list
      this.state.activeCourses.push(course);
      this.state.activeCourseId = course.id;
      this.saveState();
      
      // Trigger achievements
      this.triggerQuestCompletion("q-create");
      this.logAgentActivity("Planner Agent", `generated roadmap for "${course.title}"`);
      
      // Show Course UI Timeline
      this.renderTimeline(course);
    } catch (e) {
      console.error(e);
      alert("Composition error. Make sure API key configuration is functional.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg fill="none" stroke="currentColor" style="width:16px;" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        Compose Roadmap
      `;
    }
  }

  quickStartCourse(key) {
    const course = JSON.parse(JSON.stringify(this.engine.offlineCourses[key]));
    course.id = `course-${Date.now()}`;
    course.progress = 0;
    
    this.state.activeCourses.push(course);
    this.state.activeCourseId = course.id;
    this.saveState();
    this.triggerQuestCompletion("q-create");
    this.logAgentActivity("Planner Agent", `generated roadmap for "${course.title}"`);
    
    // Switch to Planner and draw
    this.switchView("planner");
    this.renderTimeline(course);
  }

  renderActiveCourses() {
    const container = document.getElementById("active-courses-list");
    if (!container) return;
    
    container.innerHTML = "";
    this.state.activeCourses.forEach(c => {
      const pct = this.calculateCourseProgress(c);
      const card = document.createElement("div");
      card.className = "glass-card course-card";
      card.innerHTML = `
        <div class="course-meta">
          <span class="badge-pill level">${c.level}</span>
          <span class="badge-pill style">${c.style}</span>
        </div>
        <h3 class="course-title">${c.title}</h3>
        <p class="course-desc">${c.description}</p>
        <div class="course-progress">
          <span>Mastery Progress</span>
          <span>${pct}%</span>
        </div>
        <div class="course-progress-bar">
          <div class="course-progress-fill" style="width: ${pct}%"></div>
        </div>
        <button class="btn" onclick="app.openCourseTimeline('${c.id}')">Resume Learning</button>
      `;
      container.appendChild(card);
    });
  }

  calculateCourseProgress(course) {
    const lessons = course.modules.flatMap(m => m.lessons);
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => this.state.completedLessons.includes(l.id)).length;
    return Math.round((completed / lessons.length) * 100);
  }

  openCourseTimeline(courseId) {
    const course = this.state.activeCourses.find(c => c.id === courseId);
    if (!course) return;
    this.state.activeCourseId = courseId;
    this.switchView("planner");
    this.renderTimeline(course);
  }

  renderTimeline(course) {
    document.getElementById("timeline-placeholder-content").classList.add("hidden");
    const wrapper = document.getElementById("timeline-content");
    wrapper.classList.remove("hidden");
    
    document.getElementById("timeline-course-title").innerText = course.title;
    document.getElementById("timeline-course-desc").innerText = course.description;
    document.getElementById("timeline-level-badge").innerText = course.level;
    document.getElementById("timeline-style-badge").innerText = course.style;

    const list = document.getElementById("timeline-modules-list");
    list.innerHTML = "";

    course.modules.forEach(mod => {
      const modDiv = document.createElement("div");
      modDiv.className = "timeline-module";
      
      let lessonsHtml = "";
      mod.lessons.forEach(les => {
        const isCompleted = this.state.completedLessons.includes(les.id);
        const checkIcon = isCompleted ? `✓` : ``;
        lessonsHtml += `
          <div class="lesson-item-timeline ${isCompleted ? 'completed' : ''}" onclick="app.studyLesson('${les.id}')">
            <div class="lesson-timeline-info">
              <div class="lesson-timeline-title">${les.title}</div>
              <div class="lesson-timeline-summary">${les.summary}</div>
            </div>
            <div class="lesson-status">${checkIcon}</div>
          </div>
        `;
      });

      modDiv.innerHTML = `
        <div class="module-marker"></div>
        <div class="module-title-timeline">${mod.title}</div>
        <div class="lesson-list-timeline">
          ${lessonsHtml}
        </div>
      `;
      list.appendChild(modDiv);
    });
  }

  /**
   * ACTIVE LESSON STUDY READER & SOCRATIC CHAT CONVERSATIONS
   */
  studyLesson(lessonId) {
    const course = this.state.activeCourses.find(c => c.id === this.state.activeCourseId);
    if (!course) return;
    
    // Find lesson in modules
    let lessonObj = null;
    course.modules.forEach(m => {
      const match = m.lessons.find(l => l.id === lessonId);
      if (match) lessonObj = match;
    });

    if (!lessonObj) return;
    
    this.state.activeLessonId = lessonId;
    this.saveState();

    // Setup Reader Panel Text
    document.getElementById("reader-lesson-title").innerText = lessonObj.title;
    document.getElementById("reader-course-title").innerText = course.title;
    document.getElementById("reader-content-body").innerHTML = lessonObj.content;

    // Hook Up Prev / Next Buttons
    const flatLessons = course.modules.flatMap(m => m.lessons);
    const currIdx = flatLessons.findIndex(l => l.id === lessonId);
    
    const prevBtn = document.getElementById("reader-prev-btn");
    const nextBtn = document.getElementById("reader-next-btn");

    if (currIdx > 0) {
      prevBtn.style.display = "block";
      prevBtn.onclick = () => this.studyLesson(flatLessons[currIdx - 1].id);
    } else {
      prevBtn.style.display = "none";
    }

    if (currIdx < flatLessons.length - 1) {
      nextBtn.innerText = "Next Lesson";
      nextBtn.onclick = () => this.studyLesson(flatLessons[currIdx + 1].id);
    } else {
      nextBtn.innerText = "Timeline Complete";
      nextBtn.onclick = () => {
        this.markLessonComplete(lessonId);
        this.switchView("planner");
      };
    }

    // Trigger completions & load conversations
    this.markLessonComplete(lessonId);
    this.switchView("reader");
    this.logAgentActivity("Tutor Agent", `explained "${lessonObj.title}"`);
    this.logAgentActivity("Resource Agent", `found 3 videos for "${lessonObj.title}"`);
    this.loadSocraticChatForLesson(lessonObj);
  }

  markLessonComplete(lessonId) {
    if (!this.state.completedLessons.includes(lessonId)) {
      this.state.completedLessons.push(lessonId);
      this.gainXP(20);
      this.saveState();
    }
  }

  // Load chat dialogue logic
  loadSocraticChatForLesson(lesson) {
    const container = document.getElementById("reader-chat-messages");
    if (!container) return;
    
    container.innerHTML = "";
    
    // Init dialogue template history if empty
    if (!this.state.chatHistories[lesson.id]) {
      this.state.chatHistories[lesson.id] = [
        {
          sender: "mentor",
          text: `Welcome! Let's explore **"${lesson.title}"** conceptually. Rather than just repeating facts, I'll guide you step-by-step. Let me ask: how would you describe the core objective of this lesson in your own terms?`
        }
      ];
      this.saveState();
    }

    const history = this.state.chatHistories[lesson.id];
    history.forEach(msg => {
      this.appendChatBubble(container, msg.sender, msg.text);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  appendChatBubble(container, sender, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    
    // Convert basic markdown format for display
    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
      
    bubble.innerHTML = `
      <div>${cleanText}</div>
      <div class="chat-bubble-actions">
        <button class="audio-btn" onclick="app.speakText('${text.replace(/'/g, "\\'")}')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          Read Aloud
        </button>
      </div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  // Audio Synthesis Reader
  speakText(text) {
    if ('speechSynthesis' in window) {
      // Cancel previous speak streams
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      // Select appropriate English voice if available
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
      if (enVoice) utterance.voice = enVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS Text-to-Speech synthesis not supported on this browser.");
    }
  }

  // Send message on Socratic Chat
  async sendSocraticMessage() {
    const input = document.getElementById("reader-chat-input");
    const text = input.value.trim();
    if (!text) return;
    
    input.value = "";
    
    const lessonId = this.state.activeLessonId;
    const history = this.state.chatHistories[lessonId];
    
    // Add student message
    history.push({ sender: "student", text: text });
    const container = document.getElementById("reader-chat-messages");
    this.appendChatBubble(container, "student", text);
    this.saveState();
    
    // Trigger quest completion
    this.triggerQuestCompletion("q-socratic");

    // Add loading indicator bubble
    const loadingBubble = document.createElement("div");
    loadingBubble.className = "chat-bubble mentor";
    loadingBubble.innerHTML = "<em>Socratic Mentor is formulating question...</em>";
    container.appendChild(loadingBubble);
    container.scrollTop = container.scrollHeight;

    // Get Active Lesson Metadata
    const course = this.state.activeCourses.find(c => c.id === this.state.activeCourseId);
    let activeLesson = null;
    course.modules.forEach(m => {
      const match = m.lessons.find(l => l.id === lessonId);
      if (match) activeLesson = match;
    });

    try {
      const reply = await this.engine.getSocraticResponse(
        activeLesson.title,
        activeLesson.socraticPrompt,
        history.slice(0, -1),
        text,
        this.state.apiKey
      );
      
      loadingBubble.remove();
      history.push({ sender: "mentor", text: reply });
      this.appendChatBubble(container, "mentor", reply);
      this.saveState();
      this.logAgentActivity("Tutor Agent", `answered Socratic question on "${activeLesson.title}"`);
    } catch (e) {
      console.error(e);
      loadingBubble.innerHTML = "<span style='color:red;'>Mentor connection error. Falling back to offline guide.</span>";
    }
  }

  // Direct Sidebar Chat Panel Loader
  loadSocraticMentorDirectPanel() {
    const selectLabel = document.getElementById("chat-placeholder-content");
    const wrapper = document.getElementById("chat-active-content");
    
    if (!this.state.activeLessonId) {
      selectLabel.classList.remove("hidden");
      wrapper.classList.add("hidden");
      return;
    }

    selectLabel.classList.add("hidden");
    wrapper.classList.remove("hidden");

    // Get Active Course & Lesson titles
    const course = this.state.activeCourses.find(c => c.id === this.state.activeCourseId);
    let activeLesson = null;
    course.modules.forEach(m => {
      const match = m.lessons.find(l => l.id === this.state.activeLessonId);
      if (match) activeLesson = match;
    });

    document.getElementById("chat-mentor-context-lesson").innerText = `Lesson: ${activeLesson.title}`;
    document.getElementById("chat-mentor-context-course").innerText = `Course: ${course.title}`;

    const container = document.getElementById("direct-chat-messages-box");
    container.innerHTML = "";

    const history = this.state.chatHistories[this.state.activeLessonId] || [];
    history.forEach(msg => {
      this.appendChatBubble(container, msg.sender, msg.text);
    });

    container.scrollTop = container.scrollHeight;
  }

  async sendDirectSocraticMessage() {
    const input = document.getElementById("direct-chat-input-box");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    const lessonId = this.state.activeLessonId;
    const history = this.state.chatHistories[lessonId];
    
    history.push({ sender: "student", text: text });
    const container = document.getElementById("direct-chat-messages-box");
    this.appendChatBubble(container, "student", text);
    this.saveState();
    this.triggerQuestCompletion("q-socratic");

    const loadingBubble = document.createElement("div");
    loadingBubble.className = "chat-bubble mentor";
    loadingBubble.innerHTML = "<em>Socratic Mentor is formulating question...</em>";
    container.appendChild(loadingBubble);
    container.scrollTop = container.scrollHeight;

    const course = this.state.activeCourses.find(c => c.id === this.state.activeCourseId);
    let activeLesson = null;
    course.modules.forEach(m => {
      const match = m.lessons.find(l => l.id === lessonId);
      if (match) activeLesson = match;
    });

    try {
      const reply = await this.engine.getSocraticResponse(
        activeLesson.title,
        activeLesson.socraticPrompt,
        history.slice(0, -1),
        text,
        this.state.apiKey
      );
      
      loadingBubble.remove();
      history.push({ sender: "mentor", text: reply });
      this.appendChatBubble(container, "mentor", reply);
      this.saveState();
      this.logAgentActivity("Tutor Agent", `answered Socratic question on "${activeLesson.title}"`);
    } catch (e) {
      console.error(e);
      loadingBubble.innerHTML = "<span style='color:red;'>Mentor connection error.</span>";
    }
  }

  /**
   * DYNAMIC QUIZ ARENA SYSTEM
   */
  startQuizForActiveLesson() {
    const course = this.state.activeCourses.find(c => c.id === this.state.activeCourseId);
    let activeLesson = null;
    course.modules.forEach(m => {
      const match = m.lessons.find(l => l.id === this.state.activeLessonId);
      if (match) activeLesson = match;
    });

    if (!activeLesson || !activeLesson.quiz || activeLesson.quiz.length === 0) {
      alert("This lesson does not contain quizzes yet.");
      return;
    }

    this.quiz.lessonId = activeLesson.id;
    this.quiz.questions = activeLesson.quiz;
    this.quiz.currentQuestionIndex = 0;
    this.quiz.answersSubmitted = [];
    this.quiz.isExplanationVisible = false;
    this.logAgentActivity("Quiz Agent", `prepared ${activeLesson.quiz.length} MCQs for "${activeLesson.title}"`);

    // Swap layouts
    document.getElementById("quiz-placeholder-content").classList.add("hidden");
    document.getElementById("quiz-active-layout").classList.remove("hidden");
    
    this.switchView("quiz");
    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const qIndex = this.quiz.currentQuestionIndex;
    const q = this.quiz.questions[qIndex];
    
    document.getElementById("quiz-subject-title").innerText = `Active Assessment: Q${qIndex+1}`;
    document.getElementById("quiz-question-number").innerText = `Question ${qIndex + 1} of ${this.quiz.questions.length}`;
    
    // Quiz Progress Bar
    const pct = (qIndex / this.quiz.questions.length) * 100;
    document.getElementById("quiz-progress-fill-bar").style.width = `${pct}%`;

    document.getElementById("quiz-question-text").innerText = q.question;

    const optionsContainer = document.getElementById("quiz-options-container");
    optionsContainer.innerHTML = "";

    q.options.forEach((opt, idx) => {
      const div = document.createElement("div");
      div.className = "quiz-option";
      div.innerHTML = `
        <div class="option-indicator"></div>
        <div style="flex-grow:1;">${opt}</div>
      `;
      div.addEventListener("click", () => this.selectQuizOption(idx));
      optionsContainer.appendChild(div);
    });

    // Reset feedback block styles
    const fb = document.getElementById("quiz-feedback-block");
    fb.classList.remove("visible");
    
    const actBtn = document.getElementById("quiz-next-action-btn");
    actBtn.innerText = "Submit Answer";
    actBtn.onclick = () => this.submitQuizAnswer();
  }

  selectQuizOption(index) {
    if (this.quiz.isExplanationVisible) return; // Prevent change after submit

    const options = document.querySelectorAll(".quiz-option");
    options.forEach((opt, idx) => {
      if (idx === index) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
  }

  submitQuizAnswer() {
    const selectedOpt = document.querySelector(".quiz-option.selected");
    if (!selectedOpt) {
      alert("Please choose an answer first.");
      return;
    }

    // Identify selected Index
    const options = document.querySelectorAll(".quiz-option");
    let selectedIdx = -1;
    options.forEach((opt, idx) => {
      if (opt.classList.contains("selected")) selectedIdx = idx;
    });

    const qIdx = this.quiz.currentQuestionIndex;
    const q = this.quiz.questions[qIdx];
    const isCorrect = selectedIdx === q.correctIndex;

    this.quiz.answersSubmitted.push({
      questionId: q.id,
      selectedIndex: selectedIdx,
      isCorrect: isCorrect
    });

    // Style Feedback borders
    options.forEach((opt, idx) => {
      opt.classList.remove("selected");
      if (idx === q.correctIndex) {
        opt.classList.add("correct");
      } else if (idx === selectedIdx) {
        opt.classList.add("incorrect");
      }
    });

    // Render Explanations
    const fbBox = document.getElementById("quiz-feedback-block");
    const fbTitle = document.getElementById("quiz-feedback-title");
    const fbText = document.getElementById("quiz-feedback-text");

    fbTitle.innerText = isCorrect ? "Correct!" : "Incorrect";
    fbTitle.style.color = isCorrect ? "var(--accent-emerald)" : "#ef4444";
    fbText.innerText = q.explanation;
    fbBox.classList.add("visible");

    this.quiz.isExplanationVisible = true;

    // Toggle bottom action button
    const actBtn = document.getElementById("quiz-next-action-btn");
    if (qIdx < this.quiz.questions.length - 1) {
      actBtn.innerText = "Next Question";
      actBtn.onclick = () => {
        this.quiz.currentQuestionIndex++;
        this.quiz.isExplanationVisible = false;
        this.renderQuizQuestion();
      };
    } else {
      actBtn.innerText = "Complete Quiz";
      actBtn.onclick = () => this.completeQuizArena();
    }
  }

  completeQuizArena() {
    const correctCount = this.quiz.answersSubmitted.filter(a => a.isCorrect).length;
    const total = this.quiz.questions.length;
    const pct = Math.round((correctCount / total) * 100);

    alert(`Quiz completed! You scored ${correctCount}/${total} (${pct}%)`);

    // Complete Daily quest check
    this.triggerQuestCompletion("q-quiz");
    this.gainXP(30);
    this.logAgentActivity("Progress Agent", `updated mastery metrics`);

    // Close arena view
    document.getElementById("quiz-active-layout").classList.add("hidden");
    document.getElementById("quiz-placeholder-content").classList.remove("hidden");
    this.switchView("dashboard");
  }

  /**
   * SPACED REPETITION FLASHCARDS (Leitner System)
   */
  loadFlashcardDeckSelection() {
    const placeholder = document.getElementById("flashcards-placeholder");
    const activeLayout = document.getElementById("flashcards-active-layout");

    // Check if we have active lessons to pull cards from
    if (this.state.completedLessons.length === 0) {
      placeholder.classList.remove("hidden");
      activeLayout.classList.add("hidden");
      return;
    }

    placeholder.classList.add("hidden");
    activeLayout.classList.remove("hidden");

    // Compile deck of cards based on completed lessons
    let compiledDeck = [];
    this.state.activeCourses.forEach(c => {
      c.modules.forEach(m => {
        m.lessons.forEach(l => {
          if (this.state.completedLessons.includes(l.id) && l.flashcards) {
            l.flashcards.forEach(card => {
              compiledDeck.push({
                lessonId: l.id,
                courseTitle: c.title,
                ...card
              });
            });
          }
        });
      });
    });

    if (compiledDeck.length === 0) {
      placeholder.classList.remove("hidden");
      activeLayout.classList.add("hidden");
      return;
    }

    this.flashcards.cards = compiledDeck;
    this.flashcards.currentIndex = 0;

    this.renderFlashcard();
  }

  renderFlashcard() {
    const idx = this.flashcards.currentIndex;
    const card = this.flashcards.cards[idx];
    
    // Reset flipped state
    const cardEl = document.querySelector(".flashcard-3d");
    if (cardEl) cardEl.classList.remove("flipped");

    document.getElementById("deck-source-title").innerText = card.courseTitle;
    document.getElementById("deck-card-counter").innerText = `Card ${idx + 1} of ${this.flashcards.cards.length}`;

    document.getElementById("flashcard-front-text").innerText = card.question;
    document.getElementById("flashcard-back-text").innerText = card.answer;
  }

  gradeFlashcard(score) {
    // Spaced Leitner score triggers XP gain
    this.gainXP(5);
    
    const idx = this.flashcards.currentIndex;
    if (idx < this.flashcards.cards.length - 1) {
      this.flashcards.currentIndex++;
      this.renderFlashcard();
    } else {
      alert("Spaced Repetition deck study completed! Excellent recall training.");
      this.switchView("dashboard");
    }
  }

  /**
   * FOCUS SANCTUARY & WEB AUDIO API SYNTHESIZER
   */
  startFocusSanctuary() {
    this.switchView("focus");
    this.triggerQuestCompletion("q-focus");
  }

  togglePomodoro() {
    const btn = document.getElementById("pomodoro-toggle-btn");
    
    if (this.pomodoro.isRunning) {
      // Pause
      clearInterval(this.pomodoro.timerId);
      this.pomodoro.isRunning = false;
      btn.innerText = "Resume Session";
    } else {
      // Start
      this.pomodoro.isRunning = true;
      btn.innerText = "Pause Session";
      
      this.pomodoro.timerId = setInterval(() => {
        this.tickPomodoro();
      }, 1000);
    }
  }

  tickPomodoro() {
    if (this.pomodoro.seconds === 0) {
      if (this.pomodoro.minutes === 0) {
        // Complete state
        this.handlePomodoroCycleComplete();
        return;
      }
      this.pomodoro.minutes--;
      this.pomodoro.seconds = 59;
    } else {
      this.pomodoro.seconds--;
    }

    this.renderPomodoroDigits();
  }

  renderPomodoroDigits() {
    const minStr = String(this.pomodoro.minutes).padStart(2, "0");
    const secStr = String(this.pomodoro.seconds).padStart(2, "0");
    
    document.getElementById("pomodoro-timer-digits").innerText = `${minStr}:${secStr}`;

    // Update Concentric Stroke Dashoffset
    const circle = document.getElementById("pomodoro-progress");
    if (circle) {
      const maxSeconds = this.pomodoro.mode === "focus" ? 25 * 60 : 5 * 60;
      const currentSeconds = this.pomodoro.minutes * 60 + this.pomodoro.seconds;
      const totalDash = 722.5; // Circle circumference 2 * pi * r
      
      const offset = (currentSeconds / maxSeconds) * totalDash;
      circle.style.strokeDashoffset = totalDash - offset;
    }
  }

  resetPomodoro() {
    clearInterval(this.pomodoro.timerId);
    this.pomodoro.isRunning = false;
    this.pomodoro.minutes = this.pomodoro.mode === "focus" ? 25 : 5;
    this.pomodoro.seconds = 0;
    
    const btn = document.getElementById("pomodoro-toggle-btn");
    btn.innerText = "Start Session";
    
    this.renderPomodoroDigits();
  }

  handlePomodoroCycleComplete() {
    clearInterval(this.pomodoro.timerId);
    this.pomodoro.isRunning = false;
    
    if (this.pomodoro.mode === "focus") {
      this.speakText("Time to take a break! Outstanding work focusing.");
      alert("Pomodoro complete! Take a 5-minute break.");
      this.gainXP(50);
      
      this.pomodoro.mode = "break";
      this.pomodoro.minutes = 5;
      document.getElementById("pomodoro-timer-label").innerText = "Short Break";
    } else {
      this.speakText("Break is over. Let's start focusing again.");
      alert("Break complete! Ready to study?");
      
      this.pomodoro.mode = "focus";
      this.pomodoro.minutes = 25;
      document.getElementById("pomodoro-timer-label").innerText = "Focus Mode";
    }

    this.resetPomodoro();
  }

  // Web Audio API Ambient Noise Synthesizer (Zero-Assets White/Pink Noise)
  initAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended by browser
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  stopAmbientNodes() {
    this.ambientNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.ambientNodes = [];
  }

  setAmbientSound(type) {
    this.initAudioCtx();
    this.stopAmbientNodes();
    
    // Style toggle
    document.querySelectorAll(".soundscape-card").forEach(card => {
      if (card.getAttribute("data-sound") === type) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    this.activeAmbientSound = type;
    if (type === "none") return;

    if (type === "binaural") {
      this.playBinauralBeats();
    } else if (type === "rain") {
      this.playRainSynthesis();
    } else if (type === "brownian") {
      this.playBrownianNoise();
    }
  }

  playBinauralBeats() {
    const oscL = this.audioCtx.createOscillator();
    const oscR = this.audioCtx.createOscillator();
    const pannerL = this.audioCtx.createStereoPanner();
    const pannerR = this.audioCtx.createStereoPanner();
    const mainGain = this.audioCtx.createGain();

    oscL.frequency.value = 200; // Left ear base frequency
    oscR.frequency.value = 206; // Right ear (6Hz Theta diff)

    pannerL.pan.value = -1; // Full left
    pannerR.pan.value = 1;  // Full right
    mainGain.gain.value = 0.08; // Keep it quiet and soft

    oscL.connect(pannerL).connect(mainGain).connect(this.audioCtx.destination);
    oscR.connect(pannerR).connect(mainGain).connect(this.audioCtx.destination);

    oscL.start();
    oscR.start();

    this.ambientNodes.push(oscL, oscR);
  }

  playBrownianNoise() {
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate volume loss
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to make it warmer
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const gain = this.audioCtx.createGain();
    gain.gain.value = 0.15;

    noiseSource.connect(filter).connect(gain).connect(this.audioCtx.destination);
    noiseSource.start();

    this.ambientNodes.push(noiseSource);
  }

  playRainSynthesis() {
    // Generate pink noise base
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // normal gain
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Low pass filters for storm rumble
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = 350;
    filter.Q.value = 1.0;
    filter.gain.value = 2.0;

    const gain = this.audioCtx.createGain();
    gain.gain.value = 0.22;

    noiseSource.connect(filter).connect(gain).connect(this.audioCtx.destination);
    noiseSource.start();

    this.ambientNodes.push(noiseSource);
  }
}

// Instantiate and start app on page load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new EduMentorApp();
  window.app.init();
});
