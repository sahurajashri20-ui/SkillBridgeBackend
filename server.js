const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
/* =========================================================
   PDF UPLOADS
========================================================= */

const uploadDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {

        const safeName =
            Date.now() +
            "-" +
            file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

        cb(null, safeName);
    }

});

const pdfUpload = multer({

    storage: storage,

    fileFilter: function (req, file, cb) {

        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed."));
        }

    },

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});

/* =========================================================
   DATABASE
========================================================= */

const databaseFile = path.join(__dirname, "data.json");


function readDatabase() {

    try {

        if (!fs.existsSync(databaseFile)) {

            return {
                students: []
            };

        }

        const data =
            JSON.parse(
                fs.readFileSync(
                    databaseFile,
                    "utf8"
                )
            );


        if (!Array.isArray(data.students)) {
            data.students = [];
        }


        return data;

    } catch (error) {

        console.error(
            "Database read error:",
            error.message
        );

        return {
            students: []
        };
    }
}


function saveDatabase(data) {

    fs.writeFileSync(
        databaseFile,
        JSON.stringify(
            data,
            null,
            2
        )
    );
}


function getNextStudentId(students) {

    if (!students.length) {
        return 1;
    }


    return (
        Math.max(
            ...students.map(
                student =>
                    Number(student.id) || 0
            )
        ) + 1
    );
}


/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {

    res.json({

        message:
            "SkillBridge Backend is running",

        status:
            "online",

        version:
            "2.0"

    });

});


/* =========================================================
   STUDENT CREATE
========================================================= */

app.post("/api/students", (req, res) => {

    const {
        name,
        email,
        skills
    } = req.body;


    if (!name || !email) {

        return res.status(400).json({

            message:
                "Name and email are required"

        });

    }


    const database =
        readDatabase();


    const existingStudent =
        database.students.find(
            student =>
                student.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (existingStudent) {

        return res.status(200).json({

            message:
                "Student already exists",

            student:
                existingStudent

        });

    }


    const student = {

        id:
            getNextStudentId(
                database.students
            ),

        name:
            name,

        email:
            email,

        skills:
            Array.isArray(skills)
                ? skills
                : [],

        qualification:
            "",

        college:
            "",

        graduationYear:
            "",

        cvName:
            "",

        certificateNames:
            [],

        achievements:
            "",

        assessment:
            null

    };


    database.students.push(
        student
    );


    saveDatabase(
        database
    );


    res.json({

        message:
            "Student added successfully",

        student:
            student

    });

});


/* =========================================================
   SIGNUP
========================================================= */

app.post("/api/signup", (req, res) => {

    const {
        name,
        email,
        skills
    } = req.body;


    if (!name || !email) {

        return res.status(400).json({

            message:
                "Name and email are required"

        });

    }


    const database =
        readDatabase();


    const existingStudent =
        database.students.find(
            student =>
                student.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (existingStudent) {

        return res.status(400).json({

            message:
                "Email already registered"

        });

    }


    const student = {

        id:
            getNextStudentId(
                database.students
            ),

        name:
            name,

        email:
            email,

        skills:
            Array.isArray(skills)
                ? skills
                : [],

        qualification:
            "",

        college:
            "",

        graduationYear:
            "",

        cvName:
            "",

        certificateNames:
            [],

        achievements:
            "",

        assessment:
            null

    };


    database.students.push(
        student
    );


    saveDatabase(
        database
    );


    res.json({

        message:
            "Account created successfully",

        student:
            student

    });

});


/* =========================================================
   LOGIN
========================================================= */

app.post("/api/login", (req, res) => {

    const {
        email
    } = req.body;


    if (!email) {

        return res.status(400).json({

            message:
                "Email is required"

        });

    }


    const database =
        readDatabase();


    const student =
        database.students.find(
            student =>
                student.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (!student) {

        return res.status(404).json({

            message:
                "Student not found"

        });

    }


    res.json({

        message:
            "Login successful",

        student:
            student

    });

});


/* =========================================================
   GET ALL STUDENTS
========================================================= */

app.get("/api/students", (req, res) => {

    const database =
        readDatabase();


    res.json(
        database.students
    );

});


/* =========================================================
   STUDENT PROFILE
========================================================= */

app.put(
    "/api/students/profile",
    (req, res) => {

        const {
            name,
            email,
            qualification,
            college,
            graduationYear,
            skills,
            cvName,
            certificateNames,
            achievements
        } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required"

            });

        }


        const database =
            readDatabase();


        let student =
            database.students.find(
                item =>
                    item.email.toLowerCase() ===
                    email.toLowerCase()
            );


        /*
           If the student exists only in localStorage,
           create the backend record automatically.
        */

        if (!student) {

            student = {

                id:
                    getNextStudentId(
                        database.students
                    ),

                name:
                    name || "",

                email:
                    email,

                skills:
                    [],

                qualification:
                    "",

                college:
                    "",

                graduationYear:
                    "",

                cvName:
                    "",

                certificateNames:
                    [],

                achievements:
                    "",

                assessment:
                    null

            };


            database.students.push(
                student
            );
        }


        student.name =
            name || student.name;


        student.qualification =
            qualification ||
            student.qualification ||
            "";


        student.college =
            college ||
            student.college ||
            "";


        student.graduationYear =
            graduationYear ||
            student.graduationYear ||
            "";


        if (Array.isArray(skills)) {

            student.skills =
                skills;

        }


        if (cvName) {

            student.cvName =
                cvName;

        }


        if (
            Array.isArray(
                certificateNames
            )
        ) {

            student.certificateNames =
                certificateNames;

        }


        student.achievements =
            achievements ||
            student.achievements ||
            "";


        student.updatedAt =
            new Date().toISOString();


        saveDatabase(
            database
        );


        res.json({

            message:
                "Student profile saved successfully",

            student:
                student

        });

    }
);

/* =========================================================
   CV AND CERTIFICATE UPLOAD
========================================================= */

app.post(
    "/api/students/documents",
    pdfUpload.fields([
        { name: "cv", maxCount: 1 },
        { name: "certificates", maxCount: 10 }
    ]),
    (req, res) => {

        try {

            const email = req.body.email;

            if (!email) {

                return res.status(400).json({
                    message: "Email is required"
                });

            }

            const database = readDatabase();

            const student = database.students.find(
                item =>
                    item.email &&
                    item.email.toLowerCase() ===
                    email.toLowerCase()
            );

            if (!student) {

                return res.status(404).json({
                    message: "Student not found"
                });

            }

            const cvFile =
                req.files?.cv?.[0] || null;

            const certificateFiles =
                req.files?.certificates || [];

            student.cvName =
                cvFile ? cvFile.originalname : student.cvName || "";

            student.cvFile =
                cvFile ? cvFile.filename : student.cvFile || "";

            student.certificateNames =
                certificateFiles.map(
                    file => file.originalname
                );

            student.certificateFiles =
                certificateFiles.map(
                    file => file.filename
                );

            writeDatabase(database);

            res.json({

                success: true,

                message:
                    "Documents uploaded successfully.",

                cv:
                    cvFile
                        ? cvFile.originalname
                        : null,

                certificates:
                    certificateFiles.map(
                        file => file.originalname
                    )

            });

        } catch (error) {

            console.error(
                "Document upload error:",
                error.message
            );

            res.status(500).json({

                message:
                    "Document upload failed.",

                error:
                    error.message

            });

        }

    }
);
/* =========================================================
   PRACTICE ASSESSMENT
========================================================= */

const practiceQuestions = [

    {
        id: 1,

        question:
            "Which software is commonly used for spreadsheets?",

        options: [
            "Excel",
            "Photoshop",
            "PowerPoint",
            "Chrome"
        ],

        answer:
            "Excel"
    },

    {
        id: 2,

        question:
            "Which language is commonly used for web development?",

        options: [
            "Python",
            "JavaScript",
            "SQL",
            "Excel"
        ],

        answer:
            "JavaScript"
    },

    {
        id: 3,

        question:
            "Which skill is used to work with databases?",

        options: [
            "SQL",
            "Photoshop",
            "PowerPoint",
            "Canva"
        ],

        answer:
            "SQL"
    },

    {
        id: 4,

        question:
            "Which tool is commonly used for data visualization?",

        options: [
            "Power BI",
            "Notepad",
            "Calculator",
            "Paint"
        ],

        answer:
            "Power BI"
    },

    {
        id: 5,

        question:
            "Which language is popular for data analysis?",

        options: [
            "Python",
            "HTML",
            "CSS",
            "XML"
        ],

        answer:
            "Python"
    }

];


app.get(
    "/api/assessments/practice",
    (req, res) => {

        const safeQuestions =
            practiceQuestions.map(
                ({
                    answer,
                    ...question
                }) =>
                    question
            );


        res.json(
            safeQuestions
        );

    }
);


app.post(
    "/api/assessments/practice/submit",
    (req, res) => {

        const {
            answers
        } = req.body;


        if (!Array.isArray(answers)) {

            return res.status(400).json({

                message:
                    "Answers are required"

            });

        }


        let score = 0;


        answers.forEach(
            (answer, index) => {

                if (
                    practiceQuestions[index] &&
                    answer ===
                    practiceQuestions[index].answer
                ) {

                    score++;

                }

            }
        );


        const total =
            practiceQuestions.length;


        res.json({

            message:
                "Practice assessment submitted successfully",

            score:
                score,

            total:
                total,

            percentage:
                Math.round(
                    (score / total) * 100
                )

        });

    }
);


/* =========================================================
   INDUSTRIAL ASSESSMENT
========================================================= */

const industrialQuestions = [

    {
        id: 1,

        skill:
            "Excel",

        question:
            "Which Excel formula calculates the average of cells A1 to A10?",

        options: [
            "=SUM(A1:A10)",
            "=AVERAGE(A1:A10)",
            "=COUNT(A1:A10)",
            "=TOTAL(A1:A10)"
        ],

        answer:
            "=AVERAGE(A1:A10)"
    },

    {
        id: 2,

        skill:
            "Excel",

        question:
            "Which Excel feature is commonly used to summarize large datasets by categories?",

        options: [
            "Pivot Table",
            "WordArt",
            "Page Break",
            "Spell Check"
        ],

        answer:
            "Pivot Table"
    },

    {
        id: 3,

        skill:
            "Python",

        question:
            "Which symbol is used to create a comment in Python?",

        options: [
            "//",
            "#",
            "<!-- -->",
            "/* */"
        ],

        answer:
            "#"
    },

    {
        id: 4,

        skill:
            "Python",

        question:
            "Which data structure stores values as key-value pairs in Python?",

        options: [
            "List",
            "Tuple",
            "Dictionary",
            "String"
        ],

        answer:
            "Dictionary"
    },

    {
        id: 5,

        skill:
            "SQL",

        question:
            "Which SQL command is used to retrieve data from a table?",

        options: [
            "SELECT",
            "INSERT",
            "DELETE",
            "UPDATE"
        ],

        answer:
            "SELECT"
    },

    {
        id: 6,

        skill:
            "SQL",

        question:
            "Which SQL clause is used to filter rows?",

        options: [
            "ORDER BY",
            "WHERE",
            "GROUP BY",
            "JOIN"
        ],

        answer:
            "WHERE"
    },

    {
        id: 7,

        skill:
            "Data Analysis",

        question:
            "Which measure represents the middle value of an ordered dataset?",

        options: [
            "Mean",
            "Median",
            "Range",
            "Variance"
        ],

        answer:
            "Median"
    },

    {
        id: 8,

        skill:
            "Data Analysis",

        question:
            "Which chart is generally useful for showing a trend over time?",

        options: [
            "Line chart",
            "Pie chart",
            "Radar chart",
            "Doughnut chart"
        ],

        answer:
            "Line chart"
    },

    {
        id: 9,

        skill:
            "Communication",

        question:
            "Which is an important part of effective professional communication?",

        options: [
            "Using unclear language",
            "Ignoring the audience",
            "Clear and structured communication",
            "Avoiding questions"
        ],

        answer:
            "Clear and structured communication"
    },

    {
        id: 10,

        skill:
            "Communication",

        question:
            "During a professional presentation, what should you generally do?",

        options: [
            "Read every word from the slide",
            "Speak clearly and explain the key points",
            "Avoid eye contact completely",
            "Use as much technical jargon as possible"
        ],

        answer:
            "Speak clearly and explain the key points"
    }

];


app.get(
    "/api/assessments/final",
    (req, res) => {

        const safeQuestions =
            industrialQuestions.map(
                ({
                    answer,
                    ...question
                }) =>
                    question
            );


        res.json(
            safeQuestions
        );

    }
);


/* =========================================================
   FINAL ASSESSMENT SUBMIT
========================================================= */

app.post(
    "/api/assessments/final/submit",
    (req, res) => {

        const {
            answers,
            qualification,
            email
        } = req.body;


        if (!Array.isArray(answers)) {

            return res.status(400).json({

                message:
                    "Answers are required"

            });

        }


        const skillResults = {};


        let totalCorrect = 0;


        industrialQuestions.forEach(
            (question, index) => {

                const answer =
                    answers[index];


                if (!skillResults[question.skill]) {

                    skillResults[question.skill] = {

                        correct:
                            0,

                        total:
                            0

                    };

                }


                skillResults[
                    question.skill
                ].total++;


                if (
                    answer ===
                    question.answer
                ) {

                    totalCorrect++;


                    skillResults[
                        question.skill
                    ].correct++;

                }

            }
        );


        const formattedResults = {};


        Object.keys(
            skillResults
        ).forEach(
            skill => {

                const data =
                    skillResults[skill];


                const percentage =
                    Math.round(
                        (
                            data.correct /
                            data.total
                        ) * 100
                    );


                let level;


                if (
                    percentage >= 80
                ) {

                    level =
                        "Strong";

                } else if (
                    percentage >= 50
                ) {

                    level =
                        "Developing";

                } else {

                    level =
                        "Needs Improvement";

                }


                formattedResults[
                    skill
                ] = {

                    score:
                        percentage,

                    level:
                        level,

                    correct:
                        data.correct,

                    total:
                        data.total

                };

            }
        );


        const totalQuestions =
            industrialQuestions.length;


        const percentage =
            Math.round(
                (
                    totalCorrect /
                    totalQuestions
                ) * 100
            );


        const gaps =
            Object.keys(
                formattedResults
            ).filter(
                skill =>
                    formattedResults[
                        skill
                    ].score < 80
            );


        const strongSkills =
            Object.keys(
                formattedResults
            ).filter(
                skill =>
                    formattedResults[
                        skill
                    ].score >= 80
            );


        const recommendations = [];


        gaps.forEach(
            skill => {

                if (
                    skill === "Excel"
                ) {

                    recommendations.push(
                        "Practice advanced Excel formulas, Pivot Tables and data visualization."
                    );

                }


                if (
                    skill === "Python"
                ) {

                    recommendations.push(
                        "Strengthen Python fundamentals and practise data-analysis projects."
                    );

                }


                if (
                    skill === "SQL"
                ) {

                    recommendations.push(
                        "Practise SQL queries, filtering, joins and database exercises."
                    );

                }


                if (
                    skill === "Data Analysis"
                ) {

                    recommendations.push(
                        "Improve statistics, data interpretation and visualization."
                    );

                }


                if (
                    skill === "Communication"
                ) {

                    recommendations.push(
                        "Practise professional communication, presentations and structured speaking."
                    );

                }

            }
        );


        const industries =
            getIndustryRecommendations(
                qualification,
                formattedResults
            );


        /*
           Save assessment to the student account
           if an email was supplied.
        */

        if (email) {

            const database =
                readDatabase();


            let student =
                database.students.find(
                    item =>
                        item.email.toLowerCase() ===
                        email.toLowerCase()
                );


            if (!student) {

                student = {

                    id:
                        getNextStudentId(
                            database.students
                        ),

                    name:
                        "",

                    email:
                        email,

                    skills:
                        [],

                    qualification:
                        qualification || "",

                    college:
                        "",

                    graduationYear:
                        "",

                    cvName:
                        "",

                    certificateNames:
                        [],

                    achievements:
                        "",

                    assessment:
                        null

                };


                database.students.push(
                    student
                );

            }


            student.qualification =
                qualification ||
                student.qualification ||
                "";


            student.assessment = {

                totalCorrect:
                    totalCorrect,

                totalQuestions:
                    totalQuestions,

                percentage:
                    percentage,

                skillResults:
                    Object.keys(
                        formattedResults
                    ).map(
                        skill => ({

                            skill:
                                skill,

                            percentage:
                                formattedResults[
                                    skill
                                ].score,

                            level:
                                formattedResults[
                                    skill
                                ].level

                        })
                    ),

                gaps:
                    gaps,

                strongSkills:
                    strongSkills,

                recommendations:
                    recommendations,

                industries:
                    industries,

                completedAt:
                    new Date().toISOString()

            };


            saveDatabase(
                database
            );

        }


        res.json({

            message:
                "Industrial Skill Gap Assessment submitted successfully",

            qualification:
                qualification || "Not specified",

            totalScore:
                totalCorrect,

            totalQuestions:
                totalQuestions,

            percentage:
                percentage,

            skillResults:
                formattedResults,

            gaps:
                gaps,

            strongSkills:
                strongSkills,

            recommendations:
                recommendations,

            industries:
                industries

        });

    }
);


/* =========================================================
   INDUSTRY RECOMMENDATION FUNCTION
========================================================= */

function getIndustryRecommendations(
    qualification,
    results
) {

    const industries = [];


    const hasSkill =
        function (
            skill,
            minimum
        ) {

            return (
                results[skill] &&
                results[skill].score >= minimum
            );

        };


    if (
        hasSkill("Excel", 50) ||
        hasSkill("Data Analysis", 50) ||
        hasSkill("SQL", 50)
    ) {

        industries.push(
            "Data Analytics",
            "Business Analytics",
            "MIS & Reporting"
        );

    }


    if (
        hasSkill("Python", 50) &&
        hasSkill("SQL", 50)
    ) {

        industries.push(
            "Software & Technology",
            "Data Technology"
        );

    }


    if (
        qualification === "BCom" ||
        qualification === "BBA" ||
        qualification === "MBA"
    ) {

        if (
            hasSkill("Excel", 50) ||
            hasSkill("Data Analysis", 50)
        ) {

            industries.push(
                "Finance & Banking",
                "Financial Analysis"
            );

        }

    }


    if (
        qualification === "BSc" ||
        qualification === "MSc"
    ) {

        if (
            hasSkill("Python", 50) ||
            hasSkill("Data Analysis", 50)
        ) {

            industries.push(
                "Research & Analytics",
                "Scientific Data Analysis"
            );

        }

    }


    if (
        qualification === "BTech"
    ) {

        industries.push(
            "Technology",
            "Engineering Analytics"
        );

    }


    if (
        qualification === "MBA" ||
        qualification === "BBA"
    ) {

        if (
            hasSkill("Communication", 50)
        ) {

            industries.push(
                "Business Management",
                "Consulting",
                "Operations"
            );

        }

    }


    if (!industries.length) {

        industries.push(
            "Business Operations",
            "Digital Services",
            "Entry-Level Professional Roles"
        );

    }


    return [
        ...new Set(
            industries
        )
    ];

}


/* =========================================================
   COMPANY / ROLE DATABASE
========================================================= */

const companyRoles = [

    {
        company:
            "Demo Analytics Company",

        role:
            "Junior Data Analyst",

        qualifications: [
            "BSc",
            "BTech",
            "BCom",
            "BBA",
            "MBA",
            "MSc"
        ],

        skills: {

            Excel:
                50,

            SQL:
                50,

            "Data Analysis":
                50

        }

    },

    {
        company:
            "Demo Technology Company",

        role:
            "Junior Python Developer",

        qualifications: [
            "BSc",
            "BTech",
            "MSc",
            "MBA"
        ],

        skills: {

            Python:
                50,

            SQL:
                30

        }

    },

    {
        company:
            "Demo Finance Company",

        role:
            "Financial Data Analyst",

        qualifications: [
            "BCom",
            "BBA",
            "MBA",
            "MSc"
        ],

        skills: {

            Excel:
                50,

            "Data Analysis":
                50,

            Communication:
                50

        }

    },

    {
        company:
            "Demo Business Solutions",

        role:
            "Business Analyst Trainee",

        qualifications: [
            "BBA",
            "MBA",
            "BCom",
            "BSc",
            "BTech"
        ],

        skills: {

            Excel:
                50,

            "Data Analysis":
                50,

            Communication:
                50

        }

    }

];


app.post(
    "/api/recommendations/companies",
    (req, res) => {

        const {
            qualification,
            skillResults
        } = req.body;


        if (
            !skillResults ||
            typeof skillResults !==
            "object"
        ) {

            return res.status(400).json({

                message:
                    "Skill results are required"

            });

        }


        const matches =
            companyRoles.filter(
                companyRole => {

                    if (
                        !companyRole.qualifications.includes(
                            qualification
                        )
                    ) {

                        return false;

                    }


                    return Object.entries(
                        companyRole.skills
                    ).every(
                        (
                            [
                                skill,
                                requiredScore
                            ]
                        ) => {

                            const studentSkill =
                                skillResults[
                                    skill
                                ];


                            if (!studentSkill) {

                                return false;

                            }


                            return (
                                Number(
                                    studentSkill.score
                                ) >=
                                requiredScore
                            );

                        }
                    );

                }
            );


        res.json({

            message:
                "Company recommendations generated",

            qualification:
                qualification ||
                "Not specified",

            matches:
                matches

        });

    }
);


/* =========================================================
   STUDENT ASSESSMENT UPDATE
========================================================= */

app.put(
    "/api/students/assessment",
    (req, res) => {

        const {
            email,
            qualification,
            assessment
        } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Student email is required"

            });

        }


        if (!assessment) {

            return res.status(400).json({

                message:
                    "Assessment data is required"

            });

        }


        const database =
            readDatabase();


        let student =
            database.students.find(
                item =>
                    item.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (!student) {

            student = {

                id:
                    getNextStudentId(
                        database.students
                    ),

                name:
                    "",

                email:
                    email,

                skills:
                    [],

                qualification:
                    qualification || "",

                college:
                    "",

                graduationYear:
                    "",

                cvName:
                    "",

                certificateNames:
                    [],

                achievements:
                    "",

                assessment:
                    null

            };


            database.students.push(
                student
            );

        }


        if (qualification) {

            student.qualification =
                qualification;

        }


        student.assessment =
            assessment;


        student.updatedAt =
            new Date().toISOString();


        saveDatabase(
            database
        );


        res.json({

            message:
                "Assessment performance saved successfully",

            student:
                student

        });

    }
);


/* =========================================================
   COLLEGE INSIGHTS
========================================================= */

app.get(
    "/api/college/insights",
    (req, res) => {

        const database =
            readDatabase();


        const students =
            database.students;


        const assessedStudents =
            students.filter(
                student =>
                    student.assessment
            );


        let totalScore = 0;


        assessedStudents.forEach(
            student => {

                totalScore +=
                    Number(
                        student.assessment
                            .percentage
                    ) || 0;

            }
        );


        const averageScore =
            assessedStudents.length
                ? Math.round(
                    totalScore /
                    assessedStudents.length
                )
                : 0;


        /*
           Qualification breakdown
        */

        const qualificationBreakdown = {};


        students.forEach(
            student => {

                const qualification =
                    student.qualification ||
                    "Not specified";


                qualificationBreakdown[
                    qualification
                ] =
                    (
                        qualificationBreakdown[
                            qualification
                        ] || 0
                    ) + 1;

            }
        );


        /*
           Skill averages
        */

        const skillTotals = {};


        assessedStudents.forEach(
            student => {

                const results =
                    student.assessment
                        .skillResults;


                if (!Array.isArray(results)) {
                    return;
                }


                results.forEach(
                    skill => {

                        if (
                            !skillTotals[
                                skill.skill
                            ]
                        ) {

                            skillTotals[
                                skill.skill
                            ] = {

                                total:
                                    0,

                                count:
                                    0

                            };

                        }


                        skillTotals[
                            skill.skill
                        ].total +=
                            Number(
                                skill.percentage
                            ) || 0;


                        skillTotals[
                            skill.skill
                        ].count++;

                    }
                );

            }
        );


        const skillAverages = {};


        Object.keys(
            skillTotals
        ).forEach(
            skill => {

                skillAverages[
                    skill
                ] =
                    Math.round(
                        skillTotals[
                            skill
                        ].total /
                        skillTotals[
                            skill
                        ].count
                    );

            }
        );


        /*
           Common gaps
        */

        const gapCounts = {};


        assessedStudents.forEach(
            student => {

                const gaps =
                    student.assessment
                        .gaps;


                if (!Array.isArray(gaps)) {
                    return;
                }


                gaps.forEach(
                    gap => {

                        gapCounts[gap] =
                            (
                                gapCounts[gap] ||
                                0
                            ) + 1;

                    }
                );

            }
        );


        const commonGaps =
            Object.entries(
                gapCounts
            )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b[1] - a[1]
                )
                .map(
                    entry =>
                        entry[0]
                );


        /*
           Industry skills
        */

        const industrySkills =
            Object.keys(
                skillAverages
            );


        /*
           Don't expose unnecessary sensitive
           account information in the college dashboard.
        */

        const safeStudents =
            students.map(
                student => ({

                    id:
                        student.id,

                    name:
                        student.name,

                    qualification:
                        student.qualification ||
                        "",

                    college:
                        student.college ||
                        "",

                    graduationYear:
                        student.graduationYear ||
                        "",

                    skills:
                        student.skills ||
                        [],

                    assessment:
                        student.assessment ||
                        null

                })
            );


        res.json({

            totalStudents:
                students.length,

            assessedStudents:
                assessedStudents.length,

            averageScore:
                averageScore,

            qualificationBreakdown:
                qualificationBreakdown,

            skillAverages:
                skillAverages,

            commonGaps:
                commonGaps,

            industrySkills:
                industrySkills,

            students:
                safeStudents

        });

    }
);


/* =========================================================
   GEMINI AI
========================================================= */

app.post(
    "/api/ai/recommendations",
    async (req, res) => {

        const {
            qualification,
            skills,
            skillGaps
        } = req.body;


        if (!process.env.GEMINI_API_KEY) {

            return res.status(503).json({

                message:
                    "Gemini API key is not configured."

            });

        }


        try {

            /*
               Dynamic import allows our existing
               CommonJS server to use the current
               @google/genai package.
            */

            const {
                GoogleGenAI
            } =
                await import(
                    "@google/genai"
                );


            const ai =
                new GoogleGenAI({

                    apiKey:
                        process.env.GEMINI_API_KEY

                });


            const skillText =
                Array.isArray(skills)
                    ? skills.map(
                        skill =>
                            `${skill.skill}: ${skill.percentage}% (${skill.level})`
                    ).join(", ")
                    : "No skill data";


            const gapText =
                Array.isArray(skillGaps)
                    ? skillGaps.map(
                        gap =>
                            gap.skill ||
                            gap
                    ).join(", ")
                    : "No major gaps";


            const prompt = `

You are the AI recommendation engine for SkillBridge,
a student skill-mapping platform.

Analyze the student's demonstrated assessment performance.

Educational qualification:
${qualification || "Not specified"}

Demonstrated skill performance:
${skillText}

Skill gaps:
${gapText}

Give a concise, practical recommendation for this student.

Include:

1. A short overall summary.
2. The top skills the student should improve.
3. A practical learning plan.
4. Suitable entry-level industry role areas.
5. Two CV/resume improvement suggestions based only on the supplied information.

Important:
- Do not invent qualifications, experience, companies, certificates or achievements.
- Do not claim that the student is guaranteed to get a job.
- Base recommendations on the demonstrated assessment results.
- Keep the answer suitable for a college student.
- Keep it concise and useful.
- Do not use markdown tables.

`;


            const response =
                await ai.models.generateContent({

                    model:
                        "gemini-3.8-flash",

                    contents:
                        prompt,

                    config: {

                        temperature:
                            0.4

                    }

                });


            const recommendation =
                response.text ||
                "No AI recommendation was generated.";


            res.json({

                success:
                    true,

                model:
                    "gemini-3.8-flash",

                recommendation:
                    recommendation

            });


        } catch (error) {

            console.error(
                "Gemini error:",
                error
            );


            res.status(500).json({

                message:
                    "AI recommendation could not be generated.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   SERVER START
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "SkillBridge Backend"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            "======================================"
        );

    }
);
