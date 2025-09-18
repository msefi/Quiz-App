const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5133/api";

export const apiUrl = {
    quiz: `${baseUrl}/Quiz`,
    questionByQuiz: `${baseUrl}/Question/quiz`,
    question: `${baseUrl}/Question`,
    category: `${baseUrl}/categories`,
    auth: `${baseUrl}/auth`,
    user: `${baseUrl}/users`,
};

export const publicApiUrl = {
    question: `${baseUrl}/PublicQuestion`,
    quizAttempt: `${baseUrl}/PublicQuiz/attempt`,
    startQuiz: `${baseUrl}/PublicQuiz/start`,
    submitAnswer: `${baseUrl}/PublicQuiz/answer`,
    finish: `${baseUrl}/PublicQuiz/finish`,
};

export const quizId = "019952cb-20b4-732d-87e7-918151cf883c";
