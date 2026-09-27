const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const databaseFile = "data.json";

// Read database
function readDatabase() {
  return JSON.parse(fs.readFileSync(databaseFile, "utf8"));
}

// Save database
function saveDatabase(data) {
  fs.writeFileSync(
    databaseFile,
    JSON.stringify(data, null, 2)
  );
}

// Home
app.get("/", (req, res) => {
  res.json({
    message: "SkillBridge Backend is running 🚀"
  });
});

// Add student
app.post("/api/students", (req, res) => {
  const { name, email, skills } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  const database = readDatabase();

  const student = {
    id: database.students.length + 1,
    name,
    email,
    skills: skills || []
  };

  database.students.push(student);
  saveDatabase(database);

  res.json({
    message: "Student added successfully",
    student
  });
});
// Student signup
app.post("/api/signup", (req, res) => {
  const { name, email, skills } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  const database = readDatabase();

  const existingStudent = database.students.find(
    student => student.email === email
  );

  if (existingStudent) {
    return res.status(400).json({
      message: "Email already registered"
    });
  }

  const student = {
    id: database.students.length + 1,
    name,
    email,
    skills: skills || []
  };

  database.students.push(student);
  saveDatabase(database);

  res.json({
    message: "Account created successfully",
    student
  });
});                                                                                  
  // Student login
app.post("/api/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  const database = readDatabase();

  const student = database.students.find(
    student => student.email === email
  );

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  res.json({
    message: "Login successful",
    student
  });
});
// Get all students
app.get("/api/students", (req, res) => {
  const database = readDatabase();

  res.json(database.students);
});// Practice Assessment
app.get("/api/assessments/practice", (req, res) => {
  const questions = [
    {
      id: 1,
      question: "Which software is commonly used for spreadsheets?",
      options: ["Excel", "Photoshop", "PowerPoint", "Chrome"],
      answer: "Excel"
    },
    {
      id: 2,
      question: "Which language is commonly used for web development?",
      options: ["Python", "JavaScript", "SQL", "Excel"],
      answer: "JavaScript"
    },
    {
      id: 3,
      question: "Which skill is used to work with databases?",
      options: ["SQL", "Photoshop", "PowerPoint", "Canva"],
      answer: "SQL"
    },
    {
      id: 4,
      question: "Which tool is commonly used for data visualization?",
      options: ["Power BI", "Notepad", "Calculator", "Paint"],
      answer: "Power BI"
    },
    {
      id: 5,
      question: "Which language is popular for data analysis?",
      options: ["Python", "HTML", "CSS", "XML"],
      answer: "Python"
    }
  ];

  // Do not send correct answers to the student
  const safeQuestions = questions.map(({ answer, ...question }) => question);

  res.json(safeQuestions);
});


// Submit Practice Assessment
app.post("/api/assessments/practice/submit", (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      message: "Answers are required"
    });
  }

  const correctAnswers = [
    "Excel",
    "JavaScript",
    "SQL",
    "Power BI",
    "Python"
  ];

  let score = 0;

  answers.forEach((answer, index) => {
    if (answer === correctAnswers[index]) {
      score++;
    }
  });

  res.json({
    message: "Assessment submitted successfully",
    score: score,
    total: correctAnswers.length,
    percentage: Math.round(
      (score / correctAnswers.length) * 100
    )
  });
});
// Industrial Skill Gap Assessment
app.get("/api/assessments/final", (req, res) => {
  const questions = [
    {
      id: 1,
      skill: "Excel",
      question: "Which Excel function is commonly used to calculate the average?",
      options: ["SUM", "AVERAGE", "COUNTIF", "MAX"],
      answer: "AVERAGE"
    },
    {
      id: 2,
      skill: "Excel",
      question: "Which feature is useful for summarizing large amounts of Excel data?",
      options: ["Pivot Table", "WordArt", "Page Color", "Text Box"],
      answer: "Pivot Table"
    },
    {
      id: 3,
      skill: "Python",
      question: "Which symbol is used to start a comment in Python?",
      options: ["//", "#", "<!--", "/*"],
      answer: "#"
    },
    {
      id: 4,
      skill: "Python",
      question: "Which data type is used to store multiple items in an ordered collection?",
      options: ["List", "Boolean", "Integer", "Float"],
      answer: "List"
    },
    {
      id: 5,
      skill: "SQL",
      question: "Which SQL command is used to retrieve data from a table?",
      options: ["SELECT", "DELETE", "UPDATE", "DROP"],
      answer: "SELECT"
    },
    {
      id: 6,
      skill: "SQL",
      question: "Which SQL clause is used to filter records?",
      options: ["ORDER BY", "WHERE", "GROUP BY", "JOIN"],
      answer: "WHERE"
    },
    {
      id: 7,
      skill: "Data Analysis",
      question: "Which measure represents the middle value of a dataset?",
      options: ["Mean", "Median", "Range", "Sum"],
      answer: "Median"
    },
    {
      id: 8,
      skill: "Data Analysis",
      question: "What is the main purpose of data visualization?",
      options: [
        "To hide data",
        "To understand patterns and trends",
        "To delete data",
        "To increase file size"
      ],
      answer: "To understand patterns and trends"
    },
    {
      id: 9,
      skill: "Communication",
      question: "Which is important in professional communication?",
      options: [
        "Clear and respectful communication",
        "Ignoring questions",
        "Using unclear language",
        "Avoiding all feedback"
      ],
      answer: "Clear and respectful communication"
    },
    {
      id: 10,
      skill: "Communication",
      question: "What is active listening?",
      options: [
        "Waiting only for your turn to speak",
        "Ignoring the speaker",
        "Paying attention and understanding the speaker",
        "Changing the topic"
      ],
      answer: "Paying attention and understanding the speaker"
    }
  ];

  // Do not send correct answers to the student
  const safeQuestions = questions.map(({ answer, ...question }) => question);

  res.json(safeQuestions);
});


// Submit Industrial Skill Gap Assessment
app.post("/api/assessments/final/submit", (req, res) => {
  const { answers, qualification } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      message: "Answers are required"
    });
  }

  const correctAnswers = [
    "AVERAGE",
    "Pivot Table",
    "#",
    "List",
    "SELECT",
    "WHERE",
    "Median",
    "To understand patterns and trends",
    "Clear and respectful communication",
    "Paying attention and understanding the speaker"
  ];

  const skills = [
    "Excel",
    "Excel",
    "Python",
    "Python",
    "SQL",
    "SQL",
    "Data Analysis",
    "Data Analysis",
    "Communication",
    "Communication"
  ];

  let score = 0;
  const skillResults = {};

  answers.forEach((answer, index) => {
    const skill = skills[index];

    if (!skillResults[skill]) {
      skillResults[skill] = {
        correct: 0,
        total: 0
      };
    }

    skillResults[skill].total++;

    if (answer === correctAnswers[index]) {
      score++;
      skillResults[skill].correct++;
    }
  });

  const results = {};

  Object.keys(skillResults).forEach(skill => {
    const data = skillResults[skill];
    const percentage = Math.round(
      (data.correct / data.total) * 100
    );

    let level;

    if (percentage >= 80) {
      level = "Strong";
    } else if (percentage >= 50) {
      level = "Developing";
    } else {
      level = "Needs Improvement";
    }

    results[skill] = {
      score: percentage,
      level: level
    };
  });

  res.json({
    message: "Industrial Skill Gap Assessment submitted successfully",
    qualification: qualification || "Not specified",
    totalScore: score,
    totalQuestions: correctAnswers.length,
    percentage: Math.round(
      (score / correctAnswers.length) * 100
    ),
    skillResults: results
  });
});
// Demo Company / Role Data
const companyRoles = [
  {
    company: "Demo Analytics Company",
    role: "Junior Data Analyst",
    qualifications: ["BSc", "BTech", "BCom", "BBA", "MBA", "MSc"],
    skills: {
      "Excel": 50,
      "SQL": 50,
      "Data Analysis": 50
    }
  },
  {
    company: "Demo Technology Company",
    role: "Junior Python Developer",
    qualifications: ["BSc", "BTech", "MSc", "MBA"],
    skills: {
      "Python": 50,
      "SQL": 30
    }
  },
  {
    company: "Demo Finance Company",
    role: "Financial Data Analyst",
    qualifications: ["BCom", "BBA", "MBA", "MSc"],
    skills: {
      "Excel": 50,
      "Data Analysis": 50,
      "Communication": 50
    }
  },
  {
    company: "Demo Business Solutions",
    role: "Business Analyst Trainee",
    qualifications: ["BBA", "MBA", "BCom", "BSc", "BTech"],
    skills: {
      "Excel": 50,
      "Data Analysis": 50,
      "Communication": 50
    }
  }
];


// Match Student With Company Roles
app.post("/api/recommendations/companies", (req, res) => {
  const { qualification, skillResults } = req.body;

  if (!skillResults || typeof skillResults !== "object") {
    return res.status(400).json({
      message: "Skill results are required"
    });
  }

  const matches = companyRoles.filter(companyRole => {

    // Qualification check
    if (
      !companyRole.qualifications.includes(qualification)
    ) {
      return false;
    }

    // Skill requirement check
    return Object.entries(companyRole.skills).every(
      ([skill, requiredScore]) => {

        const studentSkill = skillResults[skill];

        if (!studentSkill) {
          return false;
        }

        return studentSkill.score >= requiredScore;
      }
    );
  });

  res.json({
    message: "Company recommendations generated",
    qualification: qualification || "Not specified",
    matches
  });
});// Demo Company / Role Data
app.listen(PORT, () => {
  console.log(`SkillBridge server running on port ${PORT}`);
});


