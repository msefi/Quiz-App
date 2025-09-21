"use client";

import Questions from "@/components/questions";
import { useRouter } from "next/navigation";
import { publicApiUrl } from "@/constants/api-url";
import { apiRequest } from "@/lib/fetcher";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import "./questions.css";

type QuizResponse = {
    id: string
    name: string
    useTimer: boolean
    timerType?: string
    timerDuration?: number
    highlightCorrectAnswer: boolean
    allowRetake: boolean
    questions: any[]
}

type Props = {
	searchParams: {
		attemptId: string;
		quizId: string
	};
};

export default function QuestionsPage({ searchParams }: Props) {
	const attemptId = searchParams.attemptId;
	const quizId = searchParams.quizId;
	const router = useRouter();
	const [questions, setQuestions] = useState<any[]>([]);
	const [attempt, setAttempt] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [questionsResponse, attemptResponse] = await Promise.all([
					apiRequest(`${publicApiUrl.question}/${quizId}`, { method: "GET" }),
					apiRequest(`${publicApiUrl.quizAttempt}/${attemptId}`, { method: "GET" }),
				]);

				if (attemptResponse.finishedAt != null) {
					router.replace("/");
					return;
				}

				setQuestions(questionsResponse);
				setAttempt(attemptResponse);
			} catch (error) {
				console.error("Failed to fetch data:", error);
				router.replace("/");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [attemptId, router]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="size-10 text-white animate-spin" />
			</div>
		);
	}

	if (!questions.length || !attempt) {
		return null;
	}

	return (
		<Questions
			questions={questions}
			limit={questions.length}
			attemptId={attemptId}
			initialAnswers={attempt.answers}
            quiz={attempt.quiz as QuizResponse}
		/>
	);
}
