"use client"

import { DataTable } from "@/components/data-table"
import { columns as getColumns, Question } from "./columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { useApi, apiRequest } from "@/lib/fetcher"
import { apiUrl } from "@/constants/api-url"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useMemo, useEffect } from "react"
import { PaginationState, Updater } from "@tanstack/react-table"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { DelayedSkeleton } from "@/components/ui/DelayedSkeleton"

type QuestionResponse = {
    totalCount: number
    items: Question[]
}

export default function Page() {
    const params = useParams()
    const quizId = params.id as string
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [search, setSearch] = useState("")
    const [inputValue, setInputValue] = useState(search)
    const page = pagination.pageIndex + 1
    const pageSize = pagination.pageSize
    const { data, isLoading, error, mutate } = useApi<QuestionResponse>(
        `${apiUrl.questionByQuiz}/${quizId}?page=${page}&pageSize=${pageSize}&search=${search}`
    )
    const [editQuestion, setEditQuestion] = useState<Question | null>(null)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const [correctAnswer, setCorrectAnswer] = useState("")
    const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([""])


    const pageCount = useMemo(() => {
        return Math.ceil((data?.totalCount || 0) / pageSize)
    }, [data?.totalCount, pageSize])

    const columns = useMemo(() => getColumns(handleEdit), [])

    useEffect(() => {
        if (editQuestion) {
            setText(editQuestion.text)
            setCorrectAnswer(editQuestion.correctAnswer)
            setIncorrectAnswers(editQuestion.incorrectAnswers.length > 0 ? editQuestion.incorrectAnswers : [""])
            setOpen(true)
        }
    }, [editQuestion])

    const handlePaginationChange = (updater: Updater<PaginationState>) => {
        setPagination((prev) => {
            const newPagination = typeof updater === "function" ? updater(prev) : updater
            return newPagination
        })
    }

    if (error) throw new Error("Failed to fetch data!")

    async function createQuestion(closeDialog: boolean = true) {
        try {
            await apiRequest(apiUrl.question, {
                method: "POST",
                body: {
                    QuizId: quizId,
                    Text: text,
                    CorrectAnswer: correctAnswer,
                    IncorrectAnswers: incorrectAnswers.filter(a => a.trim())
                },
            })
            toast.success("Question created successfully!")
            if (closeDialog) {
                setOpen(false)
                setEditQuestion(null)
            }
            setText("")
            setCorrectAnswer("")
            setIncorrectAnswers([""])
            mutate(undefined, true)
        } catch (err) {
            toast.error("Failed to create question")
            console.error("Failed to create question", err)
        }
    }

    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            setSearch(inputValue) // commit search
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }
    }

    async function updateQuestion() {
        if (!editQuestion) return
        try {
            await apiRequest(`${apiUrl.question}/${editQuestion.id}`, {
                method: "PUT",
                body: {
                    QuizId: quizId,
                    Text: text,
                    CorrectAnswer: correctAnswer,
                    IncorrectAnswers: incorrectAnswers.filter(a => a.trim())
                },
            })
            toast.success("Question updated successfully!")
            setOpen(false)
            setEditQuestion(null)
            setText("")
            setCorrectAnswer("")
            setIncorrectAnswers([""])
            mutate(undefined, true)
        } catch (err) {
            toast.error("Failed to update question")
            console.error("Failed to update question", err)
        }
    }

    function handleEdit(question: Question) {
        setEditQuestion(question)
    }

    const breadcrumbItems = [
        { label: "Home", href: "/admin" },
        { label: "Quiz", href: "/admin/quiz" },
        { label: "Questions" },
    ]

    return (
        <main className="flex-1">
            <BreadcrumbNav items={breadcrumbItems} title="Question Management" backHref="/admin/quiz" />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-8"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>
                        </div>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Question
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>{editQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
                                <DialogDescription>
                                    {editQuestion ? "Update the details for the question." : "Enter the details for the new question."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="text" className="text-right">
                                        Question
                                    </Label>
                                    <Textarea
                                        id="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="col-span-3"
                                        placeholder="Enter the question text"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="correctAnswer" className="text-right">
                                        Correct Answer
                                    </Label>
                                    <Input
                                        id="correctAnswer"
                                        value={correctAnswer}
                                        onChange={(e) => setCorrectAnswer(e.target.value)}
                                        className="col-span-3"
                                        placeholder="Enter the correct answer"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="incorrectAnswers" className="text-right">
                                        Incorrect Answers
                                    </Label>
                                    <div className="col-span-3 flex flex-col space-y-2">
                                        {incorrectAnswers.map((answer, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Input
                                                    value={answer}
                                                    onChange={(e) => {
                                                        const newAnswers = [...incorrectAnswers]
                                                        newAnswers[index] = e.target.value
                                                        setIncorrectAnswers(newAnswers)
                                                    }}
                                                    placeholder={`Incorrect answer #${index + 1}`}
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIncorrectAnswers((prev) =>
                                                            prev.filter((_, i) => i !== index)
                                                        )
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            size="sm"
                                            onClick={() => setIncorrectAnswers((prev) => [...prev, ""])}
                                        >
                                            Add Incorrect Answer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                {editQuestion ? (
                                    <>
                                        <Button type="button" onClick={updateQuestion}>
                                            Update
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button type="submit" onClick={() => createQuestion()}>
                                            Save
                                        </Button>
                                        <Button type="button" onClick={() => createQuestion(false)}>
                                            Save and New
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <DelayedSkeleton isLoading={isLoading} pageSize={pageSize} className="space-y-4" />
                    {!isLoading && (
                        <DataTable
                            columns={columns}
                            data={data?.items || []}
                            pagination={pagination}
                            onPaginationChange={handlePaginationChange}
                            pageCount={pageCount}
                        />
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
