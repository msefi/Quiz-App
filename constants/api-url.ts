const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5133/api";

export const apiUrl = {
    quiz: `${baseUrl}/Quiz`, //for create, update, and get quiz
    questionByQuiz: `${baseUrl}/Question/quiz`, //for get questions by quiz id
    question: `${baseUrl}/Question`, //for create and update question
    auth: `${baseUrl}/auth`,
};

export const publicApiUrl = {
    quiz: `${baseUrl}/PublicQuiz`, //for all quiz
    startQuiz: `${baseUrl}/PublicQuiz/start`, //for start quiz
    quizAttempt: `${baseUrl}/PublicQuiz/attempt`,
    submitAnswer: `${baseUrl}/PublicQuiz/answer`,
    submitBulkEmptyAnswers: `${baseUrl}/PublicQuiz/answer/bulk-empty`,
    finish: `${baseUrl}/PublicQuiz/finish`,
    question: `${baseUrl}/PublicQuestion`, //for get question by attempt id
};
