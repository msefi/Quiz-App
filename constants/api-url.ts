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
    quiz: `${baseUrl}/PublicQuiz`,
    quizAttempt: `${baseUrl}/PublicQuiz/attempt`,
    startQuiz: `${baseUrl}/PublicQuiz/start`,
    submitAnswer: `${baseUrl}/PublicQuiz/answer`,
    submitBulkEmptyAnswers: `${baseUrl}/PublicQuiz/answer/bulk-empty`,
    finish: `${baseUrl}/PublicQuiz/finish`,
};
