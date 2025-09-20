"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { publicApiUrl } from "@/constants/api-url";
import { apiRequest } from "@/lib/fetcher";
import { Quiz } from "../admin/quiz/columns";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { DelayedSkeleton } from "@/components/ui/DelayedSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchQuizzes() {
            try {
                setLoading(true);
                const response = await apiRequest(`${publicApiUrl.quiz}`, {
                    method: "GET"
                });
                setQuizzes(response.items || []);
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuizzes();
    }, []);

    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(quiz =>
            quiz.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [quizzes, search]);

    function handleQuizClick(id: string) {
        router.push(`/quiz/${id}`);
    }

    return (
        <div className="bg-white p-3 shadow-md w-full md:w-[90%] lg:w-[70%] max-w-4xl md:rounded-lg">
        <div className="w-full mt-5">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Quizzes</h1>
                    <p className="text-gray-600">Choose a quiz to test your knowledge</p>
                </div>

                <div className="mb-6">
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Search quizzes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-0"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="bg-white border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-6 w-full" />
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                        <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
                        <p className="text-gray-500">Try adjusting your search or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz: Quiz) => (
                            <Card
                                key={quiz.id}
                                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white border-0 shadow-md"
                                onClick={() => handleQuizClick(quiz.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={quiz.status === "publish" ? "default" : "secondary"} className="text-xs">
                                            {quiz.status}
                                        </Badge>
                                        {quiz.useTimer && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {quiz.timerDuration ? `${quiz.timerDuration}s` : "Timed"}
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {quiz.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center">
                                            {quiz.allowRetake ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                            )}
                                            {quiz.allowRetake ? "Retake allowed" : "No retake"}
                                        </div>
                                        <div className="text-indigo-600 font-medium">
                                            Take Quiz →
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
