"use client"

import { DataTable } from "@/components/data-table"
import { columns as getColumns, Quiz } from "./columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"
import { PaginationState, Updater } from "@tanstack/react-table"
import { toast } from "sonner"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { DelayedSkeleton } from "@/components/ui/DelayedSkeleton"

type QuizResponse = {
    totalCount: number
    items: Quiz[]
}

export default function Page() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [search, setSearch] = useState("")
    const [inputValue, setInputValue] = useState(search)
    const page = pagination.pageIndex + 1
    const pageSize = pagination.pageSize
    const { data, isLoading, error, mutate } = useApi<QuizResponse>(
        `${apiUrl.quiz}?page=${page}&pageSize=${pageSize}&search=${search}`
    )
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [useTimer, setUseTimer] = useState(false)
    const [timerType, setTimerType] = useState("")
    const [timerDuration, setTimerDuration] = useState("")
    const [highlightCorrectAnswer, setHighlightCorrectAnswer] = useState(false)
    const [allowRetake, setAllowRetake] = useState(false)
    const [isPublic, setIsPublic] = useState(false)
    const [status, setStatus] = useState("draft")
    const [editQuiz, setEditQuiz] = useState<Quiz | null>(null)


    const pageCount = useMemo(() => {
        return Math.ceil((data?.totalCount || 0) / pageSize)
    }, [data?.totalCount, pageSize])

    const columns = useMemo(() => getColumns(handleEdit), [])





    const handlePaginationChange = (updater: Updater<PaginationState>) => {
        setPagination((prev) => {
            const newPagination = typeof updater === "function" ? updater(prev) : updater
            return newPagination
        })
    }

    if (error) throw new Error("Failed to fetch data!")

    function resetForm() {
        setTitle("")
        setUseTimer(false)
        setTimerType("")
        setTimerDuration("")
        setHighlightCorrectAnswer(false)
        setAllowRetake(false)
        setIsPublic(false)
        setStatus("draft")
        setEditQuiz(null)
    }

    async function createQuiz() {
        try {
            await apiRequest(apiUrl.quiz, {
                method: "POST",
                body: {
                    Title: title,
                    UseTimer: useTimer,
                    TimerType: timerType || null,
                    TimerDuration: timerDuration ? parseInt(timerDuration) : null,
                    HighlightCorrectAnswer: highlightCorrectAnswer,
                    AllowRetake: allowRetake,
                    IsPublic: isPublic,
                    // Status defaults to "draft" on the backend
                },
            })
            toast.success("Quiz created successfully!")
            setOpen(false)
            resetForm()
            mutate(undefined, true)
        } catch (err: any) {
            toast.error("Failed to create quiz")
        }
    }

    async function updateQuiz() {
        if (!editQuiz) return
        try {
            await apiRequest(`${apiUrl.quiz}/${editQuiz.id}`, {
                method: "PUT",
                body: {
                    Title: title,
                    UseTimer: useTimer,
                    TimerType: timerType || null,
                    TimerDuration: timerDuration ? parseInt(timerDuration) : null,
                    HighlightCorrectAnswer: highlightCorrectAnswer,
                    AllowRetake: allowRetake,
                    IsPublic: isPublic,
                    Status: status
                },
            })
            toast.success("Quiz updated successfully!")
            setOpen(false)
            resetForm()
            mutate(undefined, true)
        } catch (err: any) {
            const errorData = err?.info || err?.data || err;
            const errorMessage = typeof errorData === "string"
                ? errorData
                : errorData?.message || errorData?.Message || JSON.stringify(errorData) || "Unknown error";

            if (errorData?.errorCode === "PUBLISH_WITHOUT_QUESTIONS") {
                toast.error(errorMessage);
            } else {
                toast.error(errorMessage);
            }
        }

    }

    function handleEdit(quiz: Quiz) {
        setEditQuiz(quiz)
        setTitle(quiz.name)
        setUseTimer(quiz.useTimer)
        setTimerType(quiz.timerType || "")
        setTimerDuration(quiz.timerDuration ? quiz.timerDuration.toString() : "")
        setHighlightCorrectAnswer(quiz.highlightCorrectAnswer)
        setAllowRetake(quiz.allowRetake)
        setIsPublic(quiz.isPublic)
        setStatus(quiz.status || "draft")
        setOpen(true)
    }

    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            setSearch(inputValue) // commit search
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }
    }

    const breadcrumbItems = [
        { label: "Home" },
        { label: "Quiz" }
    ]

    return (
        <main className="flex-1">
            <BreadcrumbNav items={breadcrumbItems} title="Quiz Management" />
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
                            <Button onClick={resetForm}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Quiz
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>{editQuiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
                                <DialogDescription>
                                    {editQuiz ? "Update the title for the quiz." : "Enter the title for the new quiz."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">
                                        Title
                                    </Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="col-span-3"
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="useTimer" className="text-right">
                                        Use Timer
                                    </Label>
                                    <Checkbox
                                        id="useTimer"
                                        checked={useTimer}
                                        onCheckedChange={(checked) => setUseTimer(!!checked)}
                                        className="col-span-3"
                                    />
                                </div>
                                {useTimer && (
                                    <>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="timerType" className="text-right">
                                                Timer Type
                                            </Label>
                                            <Select
                                                value={timerType}
                                                onValueChange={(value) => setTimerType(value)}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select timer type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PerQuestion">Per Question</SelectItem>
                                                    <SelectItem value="Overall">Overall</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="timerDuration" className="text-right">
                                                Timer Duration (seconds)
                                            </Label>
                                            <Input
                                                id="timerDuration"
                                                type="number"
                                                min={1}
                                                value={timerDuration}
                                                onChange={(e) => setTimerDuration(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="highlightCorrectAnswer" className="text-right">
                                        Highlight Correct Answer
                                    </Label>
                                    <Checkbox
                                        id="highlightCorrectAnswer"
                                        checked={highlightCorrectAnswer}
                                        onCheckedChange={(checked) => setHighlightCorrectAnswer(!!checked)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="allowRetake" className="text-right">
                                        Allow Retake
                                    </Label>
                                    <Checkbox
                                        id="allowRetake"
                                        checked={allowRetake}
                                        onCheckedChange={(checked) => setAllowRetake(!!checked)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="isPublic" className="text-right">
                                        Is Public
                                    </Label>
                                    <Checkbox
                                        id="isPublic"
                                        checked={isPublic}
                                        onCheckedChange={(checked) => setIsPublic(!!checked)}
                                        className="col-span-3"
                                    />
                                </div>
                                {editQuiz && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">
                                            Status
                                        </Label>
                                        <Select
                                            value={status}
                                            onValueChange={(value) => setStatus(value)}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="publish">Publish</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                {editQuiz ? (
                                    <>
                                        <Button type="button" onClick={updateQuiz}>
                                            Update
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button type="submit" onClick={createQuiz}>
                                            Create
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
