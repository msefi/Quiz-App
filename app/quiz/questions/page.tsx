"use client";

import Questions from "@/components/questions";
import { redirect, useRouter } from "next/navigation";
import { publicApiUrl, quizId } from "@/constants/api-url";
import { apiRequest } from "@/lib/fetcher";
import "./questions.css";

type Props = {
	searchParams: {
		email: string;
		attemptId: string;
	};
};

export default async function QuestionsPage({ searchParams }: Props) {
	const email = searchParams.email;
	const attemptId = searchParams.attemptId;
	const router = useRouter();

	const validateEmail = (email: string) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
	};

	if (!validateEmail(email) || !attemptId) {
		router.replace("/");
	}

	const [questionsResponse, attemptResponse] = await Promise.all([
		apiRequest(publicApiUrl.question, { method: "GET" }),
		apiRequest(`${publicApiUrl.quizAttempt}/${attemptId}`, { method: "GET" }),
	]);

	if (attemptResponse.finishedAt != null) {
		router.replace("/");
	}

	return (
		<Questions
			questions={questionsResponse}
			limit={questionsResponse.length}
			attemptId={attemptId}
			email={email}
			quizId={quizId}
			initialAnswers={attemptResponse.answers}
		/>
	);
}
