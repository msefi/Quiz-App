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
import { useState, useMemo, useEffect } from "react"
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
    const [editQuiz, setEditQuiz] = useState<Quiz | null>(null)


    const pageCount = useMemo(() => {
        return Math.ceil((data?.totalCount || 0) / pageSize)
    }, [data?.totalCount, pageSize])

    const columns = useMemo(() => getColumns(handleEdit), [])

    useEffect(() => {
        if (editQuiz) {
            setTitle(editQuiz.name)
            setOpen(true)
        }
    }, [editQuiz])



    const handlePaginationChange = (updater: Updater<PaginationState>) => {
        setPagination((prev) => {
            const newPagination = typeof updater === "function" ? updater(prev) : updater
            return newPagination
        })
    }

    if (error) throw new Error("Failed to fetch data!")

    async function createQuiz() {
        try {
            await apiRequest(apiUrl.quiz, {
                method: "POST",
                body: { Title: title },
            })
            toast.success("Quiz created successfully!")
            setOpen(false)
            setTitle("")
            mutate(undefined, true)
        } catch (err) {
            toast.error("Failed to create quiz")
            console.error("Failed to create quiz", err)
        }
    }

    async function updateQuiz() {
        if (!editQuiz) return
        try {
            await apiRequest(`${apiUrl.quiz}/${editQuiz.id}`, {
                method: "PUT",
                body: { Title: title },
            })
            toast.success("Quiz updated successfully!")
            setOpen(false)
            setEditQuiz(null)
            setTitle("")
            mutate(undefined, true)
        } catch (err) {
            toast.error("Failed to update quiz")
            console.error("Failed to update quiz", err)
        }
    }

    function handleEdit(quiz: Quiz) {
        setEditQuiz(quiz)
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
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Quiz
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
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
