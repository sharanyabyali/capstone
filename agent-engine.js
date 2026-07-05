/**
 * EduMentor AI Agent Engine
 * Manages connections to the Gemini API (if key is provided) or falls back to
 * a local procedural generation and rich static database simulator.
 */

// Rich offline database for 4 core sample courses to ensure high-fidelity offline usage
const OFFLINE_COURSES = {
  "python": {
    title: "Introduction to Python Programming",
    description: "Master the fundamentals of Python, from basic variables to advanced control flow and data structures.",
    level: "Beginner",
    style: "Practical",
    modules: [
      {
        id: "py-mod-1",
        title: "Module 1: Foundations of Python",
        lessons: [
          {
            id: "py-les-11",
            title: "Variables and Data Types",
            summary: "Learn how Python stores information. Understand integers, floats, strings, and booleans, and how to assign values to variables.",
            content: `<h3>Variables & Data Types</h3>
            <p>In Python, a <strong>variable</strong> is a reserved memory location to store values. Unlike other languages, Python does not require you to declare variables before using them, or state their type. The variable is created the moment you first assign a value to it.</p>
            <pre><code># Assignment
x = 5
name = "Alex"
is_student = True
pi = 3.14159</code></pre>
            <p>Python has several built-in basic data types:</p>
            <ul>
              <li><strong>Integer (int):</strong> Whole numbers without decimal places, e.g., <code>10</code>, <code>-3</code>.</li>
              <li><strong>Float (float):</strong> Real numbers with decimal points, e.g., <code>10.5</code>, <code>-0.01</code>.</li>
              <li><strong>String (str):</strong> Text enclosed in single or double quotes, e.g., <code>"Hello"</code>.</li>
              <li><strong>Boolean (bool):</strong> Represents truth values, either <code>True</code> or <code>False</code>.</li>
            </ul>
            <p>Python utilizes <em>dynamic typing</em>, meaning the same variable can be reassigned to a different data type during execution.</p>`,
            flashcards: [
              { question: "What is a variable in Python?", answer: "A named location in memory used to store data values." },
              { question: "Does Python require explicit declaration of variable types?", answer: "No, Python is dynamically typed and infers types at runtime." },
              { question: "What are the four primary basic data types in Python?", answer: "Integer (int), Float (float), String (str), and Boolean (bool)." },
              { question: "How do you define a string in Python?", answer: "By enclosing text in either single ('...') or double (\"...\") quotes." }
            ],
            socraticPrompt: "You are Socrates, mentoring a student on Python Variables and Data Types. They know about memory slots. Guide them using questions to think about how computer programs store different kinds of data (numbers vs letters) and how they access them by name. Do not give code directly unless they are stuck, and then give code as a question.",
            quiz: [
              {
                id: "q-py-1",
                question: "Which of the following creates a string variable in Python?",
                options: [
                  "x = 'Alice'",
                  "string x = 'Alice'",
                  "x = Alice",
                  "var x = 'Alice'"
                ],
                correctIndex: 0,
                explanation: "In Python, string variables are created by assignment using quotes (e.g. x = 'Alice'). You do not need type keywords like 'string' or declaration prefixes like 'var'."
              },
              {
                id: "q-py-2",
                question: "What is the data type of the variable x = 4.0?",
                options: [
                  "Integer",
                  "Float",
                  "Double",
                  "Decimal"
                ],
                correctIndex: 1,
                explanation: "Any number in Python containing a decimal point is represented as a Float (floating-point number)."
              }
            ]
          },
          {
            id: "py-les-12",
            title: "Control Flow: If-Else & Loops",
            summary: "Learn how to make decisions and repeat blocks of code in Python using conditionals and loops.",
            content: `<h3>Control Flow</h3>
            <p>Control flow is the order in which the program's code executes. Conditional statements and loops let you modify this flow.</p>
            <h4>Conditional Statements (if, elif, else)</h4>
            <p>Conditionals check if an expression is true, executing the code inside if it is. Python uses <strong>indentation</strong> (spaces) to define scope, rather than curly braces <code>{}</code>.</p>
            <pre><code>score = 85
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")</code></pre>
            <h4>Loops (for, while)</h4>
            <p>Loops are used to repeat execution of a block of code.</p>
            <ul>
              <li><strong>For loop:</strong> Best for iterating over sequences (lists, strings, ranges).
                <pre><code>for i in range(3):
    print(i) # Outputs 0, 1, 2</code></pre>
              </li>
              <li><strong>While loop:</strong> Executes as long as a condition remains true.
                <pre><code>count = 0
while count < 3:
    print(count)
    count += 1</code></pre>
              </li>
            </ul>`,
            flashcards: [
              { question: "How does Python define code blocks/scopes for conditionals and loops?", answer: "Through indentation (typically 4 spaces) rather than curly braces." },
              { question: "What does the 'elif' statement stand for?", answer: "Else if. It allows checking multiple expressions after an initial 'if'." },
              { question: "What is the difference between a for loop and a while loop?", answer: "A 'for' loop iterates over a fixed sequence, while a 'while' loop runs as long as a condition is true." },
              { question: "What does range(5) yield in a for loop?", answer: "Integers from 0 up to, but not including, 5 (0, 1, 2, 3, 4)." }
            ],
            socraticPrompt: "You are Socrates. Discuss control flow and conditionals with the student. Ask them about how they make decisions in real life (e.g., if it rains, bring an umbrella). Help them translate real-life logic into conditional steps.",
            quiz: [
              {
                id: "q-py-3",
                question: "What is the output of range(1, 4)?",
                options: [
                  "[1, 2, 3, 4]",
                  "[1, 2, 3]",
                  "[0, 1, 2, 3]",
                  "[1, 4]"
                ],
                correctIndex: 1,
                explanation: "The range(start, stop) function yields numbers starting at 'start' and ending just before 'stop'. Thus, range(1, 4) gives 1, 2, and 3."
              },
              {
                id: "q-py-4",
                question: "Which keyword is used to evaluate a secondary condition if the first condition was false?",
                options: [
                  "else if",
                  "elseif",
                  "elif",
                  "otherwise"
                ],
                correctIndex: 2,
                explanation: "Python uses the abbreviated keyword 'elif' instead of 'else if'."
              }
            ]
          }
        ]
      },
      {
        id: "py-mod-2",
        title: "Module 2: Structuring Code & Data",
        lessons: [
          {
            id: "py-les-21",
            title: "Functions and Scope",
            summary: "Structure your code into reusable blocks called functions. Learn about local vs global variables.",
            content: `<h3>Functions & Scope</h3>
            <p>A <strong>function</strong> is a block of organized, reusable code that is used to perform a single, related action. Functions provide better modularity for your application and a high degree of code reusing.</p>
            <p>Functions are defined using the <code>def</code> keyword, followed by the function name and parentheses.</p>
            <pre><code>def greet(name):
    """This function greets the person passed in"""
    message = "Hello, " + name + "!"
    return message

# Invoking the function
print(greet("Emma"))</code></pre>
            <h4>Variable Scope</h4>
            <p>All variables in a program may not be accessible at all locations in that program. This depends on where you have declared the variable.</p>
            <ul>
              <li><strong>Local Scope:</strong> Variables created inside a function belong to the local scope of that function, and can only be used inside that function.</li>
              <li><strong>Global Scope:</strong> Variables created in the main body of the Python code belong to the global scope. Global variables are available from within any scope, global and local.</li>
            </ul>`,
            flashcards: [
              { question: "What keyword is used to declare a function in Python?", answer: "The 'def' keyword." },
              { question: "How do you pass data back from a function to the caller?", answer: "By using the 'return' statement." },
              { question: "What is local scope in a Python program?", answer: "The context inside a function where variables defined within it are private to it." },
              { question: "What is global scope?", answer: "The outermost scope of a script where variables are accessible by any function." }
            ],
            socraticPrompt: "You are Socrates. Talk to the student about functions. Use an analogy of a recipe or a machine (e.g. input ingredients, perform instructions, output dish) to guide their thinking about parameters and return values.",
            quiz: [
              {
                id: "q-py-5",
                question: "Which keyword returns a value from a Python function?",
                options: [
                  "send",
                  "yield",
                  "return",
                  "exit"
                ],
                correctIndex: 2,
                explanation: "The 'return' keyword is used to exit a function and send a value back to its caller."
              }
            ]
          }
        ]
      }
    ]
  },
  "ml": {
    title: "Machine Learning Basics",
    description: "Dive into the core paradigms of Machine Learning, explaining regression, neural networks, and evaluations.",
    level: "Intermediate",
    style: "Theoretical",
    modules: [
      {
        id: "ml-mod-1",
        title: "Module 1: Core Paradigms",
        lessons: [
          {
            id: "ml-les-11",
            title: "Supervised vs Unsupervised Learning",
            summary: "Learn the difference between learning with labeled examples and finding hidden patterns in raw data.",
            content: `<h3>Supervised vs Unsupervised Learning</h3>
            <p>At its core, machine learning involves training models to find patterns in data. The two primary methods are Supervised and Unsupervised learning.</p>
            <h4>Supervised Learning</h4>
            <p>In supervised learning, the model is trained on <strong>labeled data</strong>. This means that each training example is paired with its correct output label. The model learns to map inputs to these targets.</p>
            <ul>
              <li><strong>Regression:</strong> Predicting continuous numerical outputs (e.g., house prices).</li>
              <li><strong>Classification:</strong> Predicting discrete categories (e.g., classifying emails as spam or not spam).</li>
            </ul>
            <h4>Unsupervised Learning</h4>
            <p>In unsupervised learning, the model is given <strong>unlabeled data</strong>. The algorithm must explore the data to find patterns, structures, or relationships on its own.</p>
            <ul>
              <li><strong>Clustering:</strong> Grouping data points that share similar features (e.g., customer segmentation).</li>
              <li><strong>Dimensionality Reduction:</strong> Simplifying high-dimensional data while retaining essential features.</li>
            </ul>`,
            flashcards: [
              { question: "What distinguishes supervised learning from unsupervised learning?", answer: "Supervised learning uses labeled inputs (correct answers included); unsupervised learning uses unlabeled raw inputs." },
              { question: "What is regression in machine learning?", answer: "A supervised learning task that predicts continuous numerical values." },
              { question: "What is clustering?", answer: "An unsupervised learning task that groups similar data points together without pre-defined labels." },
              { question: "Give an example of a classification task.", answer: "Email spam detection (sorting emails into 'Spam' or 'Inbox')." }
            ],
            socraticPrompt: "You are Socrates. Introduce the student to the concept of learning. Ask them how they learned to recognize a dog (did someone show them pictures and say 'dog' - supervised; or did they cluster fuzzy animals together - unsupervised?). Guide them to understand labels.",
            quiz: [
              {
                id: "q-ml-1",
                question: "Predicting the price of a house based on its square footage is an example of:",
                options: [
                  "Clustering",
                  "Regression",
                  "Classification",
                  "Anomaly Detection"
                ],
                correctIndex: 1,
                explanation: "Since house price is a continuous numerical value, predicting it is a Regression task (a type of supervised learning)."
              }
            ]
          }
        ]
      }
    ]
  },
  "quantum": {
    title: "Quantum Computing Foundations",
    description: "Explore the fascinating laws of quantum physics applied to computation, from superposition to Shor's algorithm.",
    level: "Advanced",
    style: "Theoretical",
    modules: [
      {
        id: "qc-mod-1",
        title: "Module 1: The Quantum State",
        lessons: [
          {
            id: "qc-les-11",
            title: "Qubits and Superposition",
            summary: "Understand the fundamental unit of quantum information, the qubit, and how it can exist in multiple states simultaneously.",
            content: `<h3>Qubits & Superposition</h3>
            <p>Classical computers process information in bits, which are represented as either a <code>0</code> or a <code>1</code>. A quantum computer operates using <strong>qubits</strong> (quantum bits).</p>
            <p>Unlike a classical bit, a qubit can represent a <code>0</code>, a <code>1</code>, or a linear combination of both states simultaneously. This physical phenomenon is known as <strong>superposition</strong>.</p>
            <h4>Mathematical Representation</h4>
            <p>A qubit state |ψ⟩ is represented as a vector in a two-dimensional Hilbert space, expressed as a combination of basis states |0⟩ and |1⟩:</p>
            <p style="text-align: center; font-size: 1.2rem; margin: 15px 0;"><strong>|ψ⟩ = α|0⟩ + β|1⟩</strong></p>
            <p>Where <strong>α</strong> (alpha) and <strong>β</strong> (beta) are complex numbers representing probability amplitudes. When we measure the qubit, it collapses into either |0⟩ or |1⟩. The probability of measuring state |0⟩ is <strong>|α|²</strong>, and the probability of measuring state |1⟩ is <strong>|β|²</strong>. The sum of these probabilities must equal 1:</p>
            <p style="text-align: center; font-size: 1.1rem;"><strong>|α|² + |β|² = 1</strong></p>
            <p>Superposition allows a quantum system to perform calculations on vast numbers of possibilities at the same time, giving it unprecedented processing power for specific algorithms.</p>`,
            flashcards: [
              { question: "What is a qubit?", answer: "The fundamental unit of quantum information, capable of representing a 0, a 1, or a combination of both." },
              { question: "What is superposition?", answer: "The ability of a quantum system to exist in multiple states simultaneously until it is measured." },
              { question: "What happens mathematically when you measurement a superposition state?", answer: "The qubit state collapses into one of the basis states (|0⟩ or |1⟩) with probabilities determined by its amplitudes." },
              { question: "What is the normalization condition for a qubit's amplitudes α and β?", answer: "|α|² + |β|² = 1, ensuring the sum of all probabilities is 100%." }
            ],
            socraticPrompt: "You are Socrates. Explore quantum superposition with the student. Use the analogy of a spinning coin (which is in a blur of heads and tails while spinning - superposition, but becomes either heads or tails when stopped - measurement). Ask them what the state is while spinning.",
            quiz: [
              {
                id: "q-qc-1",
                question: "If a qubit has a state where α = 1/\\u221a2 and β = 1/\\u221a2, what is the probability of measuring state |0⟩?",
                options: [
                  "100%",
                  "25%",
                  "50%",
                  "70.7%"
                ],
                correctIndex: 2,
                explanation: "The probability of measuring |0⟩ is |α|². Since α = 1/\\u221a2, |α|² = (1/\\u221a2)² = 1/2 = 50%."
              }
            ]
          }
        ]
      }
    ]
  },
  "history": {
    title: "The Silk Road & Global Trade",
    description: "Examine the ancient network of trade routes that connected East and West, shaping economies, cultures, and empires.",
    level: "Beginner",
    style: "Visual",
    modules: [
      {
        id: "his-mod-1",
        title: "Module 1: Origins and Routes",
        lessons: [
          {
            id: "his-les-11",
            title: "Origins of the Silk Road",
            summary: "Discover how diplomatic missions and the search for heavenly horses initiated ancient transcontinental trade.",
            content: `<h3>Origins of the Silk Road</h3>
            <p>The <strong>Silk Road</strong> was not a single paved highway, but rather an interconnected web of land and maritime trade routes extending over 4,000 miles, connecting East Asia to the Mediterranean world.</p>
            <h4>Zhang Qian's Mission</h4>
            <p>The historical catalyst for the Silk Road occurred during the Han Dynasty under Emperor Wu (138 BCE). Seeking military alliances against the Xiongnu nomads, the emperor dispatched a diplomat named <strong>Zhang Qian</strong> to the West.</p>
            <p>Although his diplomatic mission failed, Zhang Qian returned with invaluable intelligence about advanced civilizations in Central Asia and Fergana (modern Uzbekistan), including reports of tall, strong, sweat-blood \"heavenly horses\" that were superior to Chinese breeds. Desiring these horses to combat nomadic invasions, the Han Dynasty expanded trade and military presence, marking the opening of the trade corridors.</p>
            <h4>Commodity Focus: Silk</h4>
            <p>While many commodities traveled along the route (spices, glass, jade, iron), **silk** was the most prized. The secret of sericulture (silk production) was strictly guarded by China, making it an incredibly luxury material in Rome, where it eventually became a symbol of extreme wealth and status.</p>`,
            flashcards: [
              { question: "Was the Silk Road a single road?", answer: "No, it was a complex network of land and sea trade routes." },
              { question: "Who was the Chinese diplomat sent by Emperor Wu that catalyzed the Silk Road's opening?", answer: "Zhang Qian." },
              { question: "What livestock did Emperor Wu desire from Fergana, prompting trade expansion?", answer: "The 'heavenly horses' (fergana horses) to fight nomadic invaders." },
              { question: "What commodity was the most lucrative Chinese export along the routes?", answer: "Silk, due to the strictly guarded secret of its production." }
            ],
            socraticPrompt: "You are Socrates. Discuss trade routes with the student. Ask them why people trade in the first place (geographic resources, specialization). Lead them to consider the dangers and rewards of traveling 4,000 miles across deserts and mountains in 100 BCE.",
            quiz: [
              {
                id: "q-his-1",
                question: "Which Han Dynasty Emperor sent Zhang Qian on his western mission?",
                options: [
                  "Emperor Qin Shi Huang",
                  "Emperor Wu of Han",
                  "Emperor Wu of Jin",
                  "Emperor Xuanzang"
                ],
                correctIndex: 1,
                explanation: "Emperor Wu of Han dispatched Zhang Qian in 138 BCE, initiating the imperial campaigns and trading relations that formed the Silk Road."
              }
            ]
          }
        ]
      }
    ]
  }
};

class AgentEngine {
  constructor() {
    this.offlineCourses = OFFLINE_COURSES;
  }

  /**
   * Helper to execute queries on Gemini API
   */
  async _callGemini(prompt, systemInstruction, apiKey) {
    if (!apiKey) {
      throw new Error("Gemini API key is required to make live AI calls.");
    }
    
    // Using the stable Gemini 2.5 flash endpoint as a standard fallback
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    // Set structure if we expect json
    if (systemInstruction && (systemInstruction.includes("JSON") || systemInstruction.includes("json"))) {
      body.generationConfig = {
        responseMimeType: "application/json"
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API call failed:", error);
      throw error;
    }
  }

  /**
   * 1. Curriculum Planner Agent
   * Generates or retrieves a syllabus roadmap.
   */
  async generateCurriculum(topic, level, learningStyle, apiKey) {
    const topicLower = topic.toLowerCase();
    
    // If offline or no API Key, search local database for matches
    if (!apiKey) {
      for (const [key, course] of Object.entries(this.offlineCourses)) {
        if (topicLower.includes(key) || key.includes(topicLower)) {
          // Return copies to prevent modifications to reference
          return JSON.parse(JSON.stringify(course));
        }
      }
      
      // If no match in the DB, procedurally generate a high-quality mockup
      return this._procedurallyGenerateCourse(topic, level, learningStyle);
    }

    // Live generation using Gemini API
    const systemInstruction = `You are a professional Curriculum Planner Agent. 
    Your goal is to design a personalized learning path based on a topic, skill level, and learning style.
    You MUST respond with a valid JSON object matching this structure:
    {
      "title": "Title of the course",
      "description": "Short overview description",
      "level": "Beginner | Intermediate | Advanced",
      "style": "Visual | Practical | Theoretical",
      "modules": [
        {
          "id": "unique-mod-id",
          "title": "Module Title",
          "lessons": [
            {
              "id": "unique-les-id",
              "title": "Lesson Title",
              "summary": "Brief 1-2 sentence overview",
              "content": "Rich HTML content explaining the lesson concept. Make it highly engaging. Use headers, code blocks, lists, and bold text. Keep it readable.",
              "flashcards": [
                { "question": "Concept Question?", "answer": "Clear conceptual answer." }
              ],
              "socraticPrompt": "Specific guidelines on how a Socratic mentor should guide a student on this lesson's concept.",
              "quiz": [
                {
                  "id": "quiz-id",
                  "question": "Question text?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctIndex": 0,
                  "explanation": "Why Option A is correct and why others are wrong."
                }
              ]
            }
          ]
        }
      ]
    }
    Generate at least 2 modules, each containing 1 to 2 comprehensive lessons. Include relevant quizzes and flashcards.`;

    const prompt = `Create a personalized syllabus for the topic: "${topic}".
    The student's skill level is "${level}" and their preferred learning style is "${learningStyle}".
    Generate comprehensive lesson HTML content that is highly educational and matches the selected learning style.`;

    try {
      const responseText = await this._callGemini(prompt, systemInstruction, apiKey);
      return JSON.parse(responseText);
    } catch (e) {
      console.warn("Live API curriculum generation failed. Falling back to local generation.", e);
      return this._procedurallyGenerateCourse(topic, level, learningStyle);
    }
  }

  /**
   * 2. Socratic Mentor Agent
   * Guides student using leading questions without direct answers.
   */
  async getSocraticResponse(lessonTitle, socraticPrompt, conversationHistory, studentMessage, apiKey) {
    if (!apiKey) {
      return this._procedurallyGenerateSocraticResponse(lessonTitle, studentMessage, conversationHistory);
    }

    const systemInstruction = `You are the Socratic Mentor Agent. 
    Lesson Context: "${lessonTitle}"
    Socratic Guidelines for this lesson: "${socraticPrompt}"
    
    CRITICAL INSTRUCTION: You must strictly act as a Socratic guide. 
    1. NEVER give direct answers, complete formulas, or completed code snippets to the student.
    2. Instead, ask constructive, leading questions that break the concept down and guide the student to think.
    3. Validate correct insights with positive reinforcement, then ask the next question to nudge them forward.
    4. Keep your responses short, conversational, friendly, and structured. Use bold formatting and spacing for clarity.`;

    // Format chat history
    let prompt = "Conversation History:\n";
    conversationHistory.forEach(msg => {
      prompt += `${msg.sender === 'student' ? 'Student' : 'Mentor'}: ${msg.text}\n`;
    });
    prompt += `Student: ${studentMessage}\nMentor: `;

    try {
      return await this._callGemini(prompt, systemInstruction, apiKey);
    } catch (e) {
      console.warn("Live Socratic API call failed. Falling back to simulator.", e);
      return this._procedurallyGenerateSocraticResponse(lessonTitle, studentMessage, conversationHistory);
    }
  }

  /**
   * Generate additional quiz questions if requested
   */
  async generateQuiz(topic, lessonTitle, apiKey) {
    if (!apiKey) {
      // Return a basic mock quiz of two questions
      return [
        {
          id: `q-mock-${Date.now()}-1`,
          question: `Which of the following describes a key element of ${topic}?`,
          options: ["A core foundational rule", "An arbitrary parameter", "A deprecated technique", "An invalid structure"],
          correctIndex: 0,
          explanation: "Foundational rules govern the core structure and behaviour of concepts in this field."
        },
        {
          id: `q-mock-${Date.now()}-2`,
          question: `What is the primary objective of studying ${lessonTitle}?`,
          options: ["To bypass understanding and get quick answers", "To develop critical thinking and master concepts", "To copy code patterns directly", "To memorize facts without applications"],
          correctIndex: 1,
          explanation: "Mastery and critical thinking are central to long-term learning retention and application."
        }
      ];
    }

    const systemInstruction = `You are the Assessment & Feedback Agent.
    Generate a JSON array of 3 multiple choice questions testing knowledge of the lesson "${lessonTitle}" inside the topic "${topic}".
    Format response as a JSON array exactly matching:
    [
      {
        "id": "unique-id",
        "question": "Question text",
        "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
        "correctIndex": 0,
        "explanation": "Detailed explanation of correct answer"
      }
    ]`;

    try {
      const responseText = await this._callGemini(`Generate a quiz for: ${lessonTitle}`, systemInstruction, apiKey);
      return JSON.parse(responseText);
    } catch (e) {
      console.warn("Live API Quiz generation failed. Falling back to local quiz.", e);
      return this.generateQuiz(topic, lessonTitle, null);
    }
  }

  /**
   * Dynamic procedural generators for clean offline/simulation flows
   */
  _procedurallyGenerateCourse(topic, level, learningStyle) {
    const cleanTopic = topic.trim().substring(0, 50);
    const idSeed = cleanTopic.toLowerCase().replace(/[^a-z0-9]/g, "-");
    
    return {
      title: `${cleanTopic} Masterclass`,
      description: `A custom-tailored curriculum on ${cleanTopic}, designed specifically for a ${level} student focusing on a ${learningStyle} study style.`,
      level: level,
      style: learningStyle,
      modules: [
        {
          id: `${idSeed}-mod-1`,
          title: "Module 1: Fundamentals of " + cleanTopic,
          lessons: [
            {
              id: `${idSeed}-les-11`,
              title: `Introduction to ${cleanTopic}`,
              summary: `Explore the foundational principles of ${cleanTopic} and set up your core understanding.`,
              content: `<h3>Foundations of ${cleanTopic}</h3>
              <p>Welcome to the structured learning path for <strong>${cleanTopic}</strong>. This custom module is designed for the <strong>${level}</strong> stage, emphasizing a <strong>${learningStyle}</strong> perspective.</p>
              <p>To master ${cleanTopic}, one must first understand its core paradigm. Every system in this domain operates on primary structures that govern behavior and relations.</p>
              <h4>Key Core Concepts</h4>
              <ul>
                <li><strong>Abstraction:</strong> Grouping details together so we can think about the big picture.</li>
                <li><strong>Syntactic Rules:</strong> The explicit laws that define how expressions are written.</li>
                <li><strong>Systematic Execution:</strong> The operational steps required to achieve goals in this domain.</li>
              </ul>
              <p>In this lesson, we will focus on identifying where these concepts show up in everyday activities and practical applications.</p>`,
              flashcards: [
                { question: `What is the core focus of ${cleanTopic}?`, answer: `Developing a deep, structured model of the system's rules and implementations.` },
                { question: "What is Abstraction?", answer: "The practice of hiding details to simplify systems and focus on main components." }
              ],
              socraticPrompt: `You are Socrates mentoring a student on ${cleanTopic}. Help them identify the general components of the topic. Ask questions comparing it to real-world networks or frameworks.`,
              quiz: [
                {
                  id: `${idSeed}-q1`,
                  question: `Which concept refers to simplifying a system by hiding internal complexities?`,
                  options: ["Abstraction", "Compilation", "Iteration", "Decoupling"],
                  correctIndex: 0,
                  explanation: "Abstraction allows learners and engineers to focus on high-level interactions by hiding details."
                }
              ]
            },
            {
              id: `${idSeed}-les-12`,
              title: `Practical Applications of ${cleanTopic}`,
              summary: `Examine real-world case studies and execute core methods in ${cleanTopic}.`,
              content: `<h3>Practical Applications</h3>
              <p>Now that we have covered the basics, we transition to practical applications. Understanding theory is crucial, but implementing workflows is where true mastery takes shape.</p>
              <p>Depending on your focus, operations in this domain generally follow a three-step cycle:</p>
              <ol>
                <li><strong>Configuration & Inputs:</strong> Gathering raw states or parameters.</li>
                <li><strong>Transformative Processing:</strong> Executing logic or actions to manipulate states.</li>
                <li><strong>Evaluative Outputs:</strong> Analyzing result accuracy against expectations.</li>
              </ol>
              <p>This structural feedback loop ensures continuously rising quality and performance.</p>`,
              flashcards: [
                { question: "What are the three steps in the processing cycle?", answer: "Configuration (Inputs), Processing (Transformation), and Evaluation (Outputs)." },
                { question: "Why is the feedback loop important?", answer: "It allows systematic refinement and guarantees accuracy over time." }
              ],
              socraticPrompt: `You are Socrates. Focus on practical loops and operations in ${cleanTopic}. Challenge the student to think of a process they do repeatedly and map it to input-process-output stages.`,
              quiz: [
                {
                  id: `${idSeed}-q2`,
                  question: "What is the third stage of the standard processing cycle?",
                  options: ["Inputs", "Transformations", "Evaluation & Outputs", "Archiving"],
                  correctIndex: 2,
                  explanation: "Evaluating outcomes against requirements is the crucial third phase in checking execution accuracy."
                }
              ]
            }
          ]
        }
      ]
    };
  }

  _procedurallyGenerateSocraticResponse(lessonTitle, studentMessage, history) {
    const msg = studentMessage.toLowerCase();
    const greetings = ["hello", "hi", "hey", "greetings"];
    const helpQueries = ["what is", "explain", "i don't understand", "tell me", "what is the answer", "help me"];
    
    if (greetings.some(g => msg.includes(g)) && history.length <= 1) {
      return `Greetings! I am your **Socratic Mentor**. We are exploring the lesson **"${lessonTitle}"**.\n\nTo begin, what is your current understanding of this topic? What real-world analogies come to mind?`;
    }

    if (msg.includes("answer") || msg.includes("give me") || msg.includes("tell me the code") || msg.includes("solve")) {
      return `Giving you the direct answer would rob you of the joy of discovery! \n\nLet's break it down instead. If you had to tackle this one small step at a time, what do you think is the very first thing we need to identify? Let's start there.`;
    }

    if (msg.includes("variable") || msg.includes("store")) {
      return `Fascinating point! You mentioned storing values. \n\nImagine you have three boxes labeled "Letters", "Integers", and "Decimals". If I hand you the item \`4.5\`, which box does it belong in? And how would you describe that box to someone else?`;
    }

    if (msg.includes("loop") || msg.includes("repeat")) {
      return `Ah, repetition! \n\nIf I asked you to clap your hands 5 times, how does your brain keep count? What trigger tells you when to stop clapping? How does this map to a loop condition?`;
    }

    return `That is an interesting perspective. Let's delve deeper into that. \n\nHow does this concept connect to what we discussed earlier about **"${lessonTitle}"**? What do you think would happen if we changed one of the inputs or conditions?`;
  }
}

// Export engine to window context
window.AgentEngine = AgentEngine;
