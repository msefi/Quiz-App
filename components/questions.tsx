"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { alphabeticNumeral, showCategory } from "@/constants";
import { publicApiUrl } from "@/constants/api-url";
import useModalStore from "@/hooks/useModalStore";
import { apiRequest } from "@/lib/fetcher";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { toast } from "sonner";

type Props = {
	questions: {
		category: string;
		id: string;
		correctAnswer: string;
		incorrectAnswers: string[];
		question: string;
		tags: string[];
		type: string;
		difficulty: string;
		regions: [];
		isNiche: boolean;
	}[];
	limit: number;
	attemptId: string;
	email: string;
	quizId: string;
	initialAnswers: {
		questionId: string;
		selectedAnswer: string;
		isCorrect: boolean;
	}[];
};

	const Questions = ({ questions, limit, attemptId, email, quizId, initialAnswers }: Props) => {
	const [curr, setCurr] = useState(0);
	const [answers, setAnswers] = useState<string[]>([]);
	const [selected, setSelected] = useState<string>("");
	const [answered, setAnswered] = useState(false);
	const [progressValue, setProgressValue] = useState(0);
	// Initialize score from initialAnswers count of correct answers
	const initialScore = initialAnswers.reduce((acc, ans) => acc + (ans.isCorrect ? 1 : 0), 0);
	const [score, setScore] = useState(initialScore);
	const { onOpen } = useModalStore();
	const [key, setKey] = useState(0);
	const [duration, setDuration] = useState(15);

	// Map initialAnswers for quick lookup
	const initialAnswerMap = useMemo(() => {
		const map = new Map<string, string>();
		initialAnswers.forEach((ans) => {
			map.set(ans.questionId, ans.selectedAnswer);
		});
		return map;
	}, [initialAnswers]);

	// Filter to unanswered questions
	const unansweredQuestions = useMemo(() => questions.filter(q => !initialAnswerMap.has(q.id)), [questions, initialAnswerMap]);
	const totalAnswered = questions.length - unansweredQuestions.length;
	const currentQuestion = unansweredQuestions[curr];
	const effectiveLimit = unansweredQuestions.length;

	const handleShuffle = (
		correctAnswer: string,
		incorrectAnswers: string[]
	) => {
		const shuffledAnswers = [...incorrectAnswers];

		shuffledAnswers.sort(() => Math.random() - 0.5);
		const randomIndex = Math.floor(
			Math.random() * (shuffledAnswers.length + 1)
		);
		shuffledAnswers.splice(randomIndex, 0, correctAnswer);

		return shuffledAnswers;
	};

	const handleCheck = async (answer: string, isTimeUp: boolean = false) => {
		setSelected(answer);
		setAnswered(true);
		if (answer === currentQuestion.correctAnswer && !isTimeUp) {
			setScore(score + 1);
		}

		// Remove timer from localStorage
		localStorage.removeItem(`timer_${attemptId}_${currentQuestion.id}`);

		// Submit answer to backend
		try {
			const questionId = currentQuestion.id;
			await apiRequest(publicApiUrl.submitAnswer, {
				method: "POST",
				body: {
					attemptId,
					questionId,
					selectedAnswer: answer,
				},
			});
		} catch (error) {
			toast.error("Failed to save answer. Please try again.");
		}
	};

	const handleSelect = (i: string) => {
		if (selected === i && selected === currentQuestion.correctAnswer) {
			return "correct";
		} else if (
			selected === i &&
			selected !== currentQuestion.correctAnswer
		) {
			return "incorrect";
		} else if (i === currentQuestion.correctAnswer) {
			return "correct";
		}
	};

	const handleNext = () => {
		setCurr((curr) => curr + 1);
		setSelected("");
		setAnswered(false);
		setKey((prevKey) => prevKey + 1);
	};

	const handleQuit = () => {
		onOpen("quitQuiz");
	};

	const handleShowResult = async () => {
		try {
			const answers = questions.map((q) => {
				const selectedAnswer = initialAnswerMap.get(q.id) || "";
				return {
					questionId: q.id,
					selectedAnswer,
				};
			});
			const response = await apiRequest(publicApiUrl.finish, {
				method: "POST",
				body: {
					attemptId: attemptId,
				},
			});
			onOpen("showResults", {
				score: response.score,
				limit,
			});
		} catch (error) {
			toast.error("Failed to submit quiz. Please try again.");
		}
	};

	const handleTimeUp = () => {
		setSelected("");
		setAnswered(true);
		toast.info("You ran out of Time!");
		// Remove timer from localStorage
		localStorage.removeItem(`timer_${attemptId}_${currentQuestion.id}`);
		// Submit empty answer asynchronously
		(async () => {
			try {
				const questionId = currentQuestion.id;
				await apiRequest(publicApiUrl.submitAnswer, {
					method: "POST",
					body: {
						attemptId,
						questionId,
						selectedAnswer: "",
					},
				});
			} catch (error) {
				toast.error("Failed to save answer. Please try again.");
			}
		})();
	};

	useEffect(() => {
		if (unansweredQuestions?.length > 0 && currentQuestion) {
			setAnswers(
				handleShuffle(
					currentQuestion.correctAnswer,
					currentQuestion.incorrectAnswers
				)
			);
		}
		setProgressValue(((totalAnswered + curr + 1) / questions.length) * 100);
	}, [curr, unansweredQuestions, currentQuestion, totalAnswered, questions.length]);

	useEffect(() => {
		// For unanswered questions, reset selected and answered
		setSelected("");
		setAnswered(false);

		// Set timer duration based on localStorage
		const timerKey = `timer_${attemptId}_${currentQuestion.id}`;
		const stored = localStorage.getItem(timerKey);
		if (stored) {
			const start = parseInt(stored);
			const elapsed = Math.floor((Date.now() - start) / 1000);
			const remaining = 15 - elapsed;
			if (remaining > 0) {
				setDuration(remaining);
			} else {
				setDuration(0.001); // Trigger time up immediately
			}
		} else {
			localStorage.setItem(timerKey, Date.now().toString());
			setDuration(15);
		}
	}, [curr, attemptId, currentQuestion]);

	if (!questions || !answers.length) {
		return <Loader2 className="size-10 text-white animate-spin" />;
	}

	return (
		<div className="bg-white px-3 py-5 md:p-6 shadow-md w-full md:w-[80%] lg:w-[70%] max-w-5xl sm:rounded-lg">
			<Progress value={progressValue} />
			<div className="flex justify-between items-center h-20 text-sm md:text-base">
				<div className="space-y-1">
					<p>Score: {score}</p>
				</div>
				<CountdownCircleTimer
					key={key}
					isPlaying={!selected}
					duration={duration}
					size={45}
					strokeWidth={4}
					colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
					colorsTime={[15, 8, 3, 0]}
					onComplete={handleTimeUp}
				>
					{({ remainingTime }) => (
						<div className="text-center">{remainingTime}</div>
					)}
				</CountdownCircleTimer>
			</div>
			<Separator />
			<div className="min-h-[50vh] py-4 xl:py-8 px-3 md:px-5 w-full">
				<p className="text-center text-sm mb-4">Question {totalAnswered + curr + 1} of {questions.length}</p>
				<h2 className="text-2xl text-center font-medium">{`${totalAnswered + curr + 1}. ${
					currentQuestion.question
				}`}</h2>
				<div className="py-4 md:py-5 xl:py-7 flex flex-col gap-y-3 md:gap-y-5">
					{answers.map((answer, i) => (
						<button
							key={i}
							className={`option ${selected && handleSelect(answer)}`}
							disabled={!!selected}
							onClick={() => handleCheck(answer)}
						>
							{alphabeticNumeral(i)}
							{answer}
						</button>
					))}
				</div>
				<Separator />
				<div className="flex mt-5 md:justify-between md:flex-row flex-col gap-4 md:gap-0 mx-auto max-w-xs w-full">
					<Button
						disabled={!answered}
						onClick={() =>
							effectiveLimit === curr + 1
								? handleShowResult()
								: handleNext()
						}
					>
						{effectiveLimit - 1 != curr
							? "Next Question"
							: "Finish"}
					</Button>
					<Button variant={"destructive"} onClick={handleQuit}>
						Quit Quiz
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Questions;
