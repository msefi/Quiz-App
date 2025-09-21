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
		id: string;
		correctAnswer: string;
		incorrectAnswers: string[];
		question: string;
		type: string;
	}[];
	limit: number;
	attemptId: string;
	initialAnswers: {
		questionId: string;
		selectedAnswer: string;
		isCorrect: boolean;
	}[];
	quiz: {
		id: string;
		name: string;
		useTimer: boolean;
		timerType?: string;
		timerDuration?: number;
		highlightCorrectAnswer: boolean;
		allowRetake: boolean;
	};
};

const Questions = ({ questions, limit, attemptId, initialAnswers, quiz }: Props) => {
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
	const isOverall = quiz.timerType === "Overall";
	const effectiveDuration = quiz.useTimer ? (quiz.timerDuration || 15) : 0;
	const totalDuration = quiz.useTimer && isOverall ? (quiz.timerDuration || 15 * questions.length) : 0;
	const [totalTimeLeft, setTotalTimeLeft] = useState(totalDuration);
	const [timeUp, setTimeUp] = useState(false);

	// Timer persistence utilities
	const getOverallTimerKey = (attemptId: string) => `overall_timer_${attemptId}`;
	const getQuestionTimerKey = (attemptId: string, questionId: string) => `timer_${attemptId}_${questionId}`;

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
		localStorage.removeItem(getQuestionTimerKey(attemptId, currentQuestion.id));

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
		if (!selected) {
			return "";
		}
		if (selected === currentQuestion.correctAnswer) {
			if (selected === i) {
				return "correct";
			}
		} else if (quiz.highlightCorrectAnswer) {
			if (selected === i) {
				return "incorrect";
			} else if (i === currentQuestion.correctAnswer) {
				return "correct";
			}
		} else {
			if (selected === i) {
				return "incorrect";
			}
		}
	};

	const handleNext = () => {
		setCurr((curr) => curr + 1);
		setSelected("");
		setAnswered(false);
		setTimeUp(false);
		setKey((prevKey) => prevKey + 1);
	};

	const handleQuit = () => {
		onOpen("quitQuiz");
	};

	const handleShowResult = async () => {
		try {
			// Clean up all timer localStorage when finishing quiz
			if (quiz.useTimer) {
				if (isOverall) {
					localStorage.removeItem(getOverallTimerKey(attemptId));
				} else {
					// Clean up all question timers
					unansweredQuestions.forEach(q => {
						localStorage.removeItem(getQuestionTimerKey(attemptId, q.id));
					});
				}
			}

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
				allowRetake: quiz.allowRetake,
			});
		} catch (error) {
			toast.error("Failed to submit quiz. Please try again.");
		}
	};

	const handleTimeUp = () => {
		setSelected("");
		setAnswered(true);
		setTimeUp(true);
		alert("You ran out of Time!");

		if (isOverall) {
			// Submit empty answers for all remaining unanswered questions with single request
			(async () => {
				const remainingQuestionIds = unansweredQuestions.slice(curr).map(q => q.id);
				try {
					await apiRequest(publicApiUrl.submitBulkEmptyAnswers, {
						method: "POST",
						body: {
							attemptId,
							questionIds: remainingQuestionIds,
						},
					});
					// Move to last question to show only Finish button
					setCurr(unansweredQuestions.length - 1);
				} catch (error) {
					toast.error("Failed to save answers. Please try again.");
				}
			})();
		} else {
			// Remove timer from localStorage for per-question timer
			localStorage.removeItem(getQuestionTimerKey(attemptId, currentQuestion.id));
			// Submit empty answer asynchronously for current question
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
		}
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
		// Reset states for new questions unless time is up
		if (!timeUp) {
			setSelected("");
			setAnswered(false);
		}

		if (!quiz.useTimer) {
			setDuration(0);
			setTotalTimeLeft(0);
			return;
		}

		if (isOverall) {
			// Overall timer logic with persistence
			const overallTimerKey = getOverallTimerKey(attemptId);
			let startTime = localStorage.getItem(overallTimerKey);

			if (!startTime) {
				// First time starting the quiz, set start time
				startTime = Date.now().toString();
				localStorage.setItem(overallTimerKey, startTime);
			}

			const start = parseInt(startTime);
			const elapsed = Math.floor((Date.now() - start) / 1000);
			const remaining = totalDuration - elapsed;

			if (remaining <= 0) {
				setTotalTimeLeft(0);
				setDuration(0);
				if (!timeUp) {
					handleTimeUp();
				}
			} else {
				setTotalTimeLeft(remaining);
				setDuration(remaining);
			}
		} else {
			// Per question timer logic with persistence
			const timerKey = getQuestionTimerKey(attemptId, currentQuestion.id);
			const stored = localStorage.getItem(timerKey);

			if (stored) {
				const start = parseInt(stored);
				const elapsed = Math.floor((Date.now() - start) / 1000);
				const remaining = effectiveDuration - elapsed;

				if (remaining > 0) {
					setDuration(remaining);
				} else {
					setDuration(0.001); // Trigger time up immediately
				}
			} else {
				// Start new timer for this question
				localStorage.setItem(timerKey, Date.now().toString());
				setDuration(effectiveDuration);
			}
		}
	}, [curr, attemptId, currentQuestion, quiz.useTimer, isOverall, totalDuration, effectiveDuration, timeUp]);

	// Real-time timer update for overall timer
	useEffect(() => {
		if (!quiz.useTimer || !isOverall || timeUp) return;

		const overallTimerKey = getOverallTimerKey(attemptId);
		const startTime = localStorage.getItem(overallTimerKey);

		if (!startTime) return;

		const updateTimer = () => {
			const start = parseInt(startTime);
			const elapsed = Math.floor((Date.now() - start) / 1000);
			const remaining = totalDuration - elapsed;

			if (remaining <= 0) {
				setTotalTimeLeft(0);
				setDuration(0);
				if (!timeUp) {
					handleTimeUp();
				}
			} else {
				setTotalTimeLeft(remaining);
				setDuration(remaining);
			}
		};

		// Update immediately
		updateTimer();

		// Update every second
		const interval = setInterval(updateTimer, 1000);

		return () => clearInterval(interval);
	}, [quiz.useTimer, isOverall, timeUp, attemptId, totalDuration]);

	if (!questions || !answers.length) {
		return <Loader2 className="size-10 text-white animate-spin" />;
	}

	return (
		<div className="bg-white px-3 py-5 md:p-6 shadow-md w-full md:w-[80%] lg:w-[70%] max-w-5xl sm:rounded-lg">
			<Progress value={progressValue} />
			<div className={`flex justify-between items-center h-20 text-sm md:text-base`}>
				<div className="space-y-1">
					<p>Score: {score}</p>
				</div>
				<div className="space-y-1">
					<p>Question {totalAnswered + curr + 1} of {questions.length}</p>
				</div>
				{quiz.useTimer && duration > 0 && (
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
						{({ remainingTime }) => {
							const hours = Math.floor(remainingTime / 3600);
							const minutes = Math.floor((remainingTime % 3600) / 60);
							const seconds = remainingTime % 60;
							const formattedTime = hours > 0
								? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
								: `${minutes}:${seconds.toString().padStart(2, '0')}`;
							return (
								<div
									className="flex items-center justify-center text-center"
									style={{
										width: 45,
										height: 45,
										fontSize: hours > 0 ? 10 : 12,
										userSelect: "none",
										lineHeight: "45px",
									}}
								>
									{formattedTime}
								</div>
							);
						}}
					</CountdownCircleTimer>
				)}
			</div>
			<Separator />
			<div className="min-h-[50vh] py-4 xl:py-8 px-3 md:px-5 w-full">
				<h2 className="text-2xl text-center font-medium">{`${totalAnswered + curr + 1}. ${
					currentQuestion.question
				}`}</h2>
				<div className="py-4 md:py-5 xl:py-7 flex flex-col gap-y-3 md:gap-y-5">
					{answers.map((answer, i) => (
					<button
						key={i}
						className={`option ${handleSelect(answer)}`}
						disabled={!!selected || answered || timeUp}
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
					{/* <Button className="invisible" variant={"destructive"} onClick={handleQuit}>
						Quit Quiz
					</Button> */}
				</div>
			</div>
		</div>
	);
};

export default Questions;
