"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { publicApiUrl, quizId } from "@/constants/api-url";
import { apiRequest } from "@/lib/fetcher";
import { toast } from "sonner";

export default function Home() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [termsAgreed, setTermsAgreed] = useState(false);

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!termsAgreed) {
            setError("You must agree to the terms and conditions");
            return;
        }

        setError("");
        
        try {
            const response = await apiRequest(publicApiUrl.startQuiz, {
                method: "POST",
                body: { email, quizId },
            });
            const attemptId = response.attemptId;
            router.push(`/quiz/questions?email=${encodeURIComponent(email)}&attemptId=${attemptId}`);
        } catch (err) {
            toast.error("Failed to start quiz. Please try again.");
        }
  };

    return (
        <div className="bg-white p-3 shadow-md w-full md:w-[90%] lg:w-[70%] max-w-4xl md:rounded-lg">
        <h1 className="text-2xl lg:text-4xl font-bold text-primary tracking-wider uppercase text-center py-2">
            Welcome to Testly
        </h1>
        <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 p-2 md:px-6 py-3 gap-4">
                <div className="relative h-full">
                    <Image
                        src={"/hero.webp"}
                        alt="hero-image"
                        priority
                        width={450}
                        height={450}
                        className="object-cover object-center mx-auto"
                    />
                </div>
                <div className="flex flex-col justify-center items-center gap-4 md:gap-6">
                    <div className="w-full max-w-md mb-4">
                        <h3 className="text-lg font-semibold mb-2">Quiz Rules:</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Answer all questions honestly without external help.</li>
                            <li>The quiz has a time limit; manage your time wisely.</li>
                            <li>Do not refresh or navigate away during the quiz.</li>
                            <li>Results will be recorded based on your email.</li>
                        </ul>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Enter your email to start the quiz
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="mt-2"
                        />
                        <div className="flex items-center space-x-2 mt-4">
                            <Checkbox
                                id="terms"
                                checked={termsAgreed}
                                onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
                            />
                            <Label htmlFor="terms" className="text-sm">
                                I agree to the terms and conditions
                            </Label>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        <Button type="submit" className="w-full mt-4" disabled={!termsAgreed}>
                            Start Quiz
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
