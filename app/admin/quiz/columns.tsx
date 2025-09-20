"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Clock, Timer, TimerOff } from "lucide-react"

export type Quiz = {
    id: string
    name: string
    useTimer: boolean
    timerType?: string
    timerDuration?: number
    highlightCorrectAnswer: boolean
    allowRetake: boolean
    isPublic: boolean
    status: string
    questionCount: number
}

export const columns = (onEdit: (quiz: Quiz) => void): ColumnDef<Quiz>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
        const quiz = row.original
        return <Link href={`/admin/quiz/${quiz.id}`} className="text-blue-600 hover:underline">{quiz.name}</Link>
        },
    },
    {
        accessorKey: "questionCount",
        header: "Total Questions",
    },
    {
        accessorKey: "useTimer",
        header: "Timer Settings",
        cell: ({ row }) => {
            const quiz = row.original
            if (!quiz.useTimer) {
                return (
                    <div className="flex items-center gap-2">
                        <TimerOff className="h-4 w-4 text-gray-400" />
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            No Timer
                        </Badge>
                    </div>
                )
            }

            return (
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="default"
                                className={`${
                                    quiz.timerType === 'PerQuestion'
                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                {quiz.timerType === 'PerQuestion' ? 'Per Question' : 'Per Quiz'}
                            </Badge>
                        </div>
                        {quiz.timerDuration && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Timer className="h-3 w-3" />
                                <span>{quiz.timerDuration}s</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "highlightCorrectAnswer",
        header: "Highlight Correct Answer",
        cell: ({ row }) => <span>{row.original.highlightCorrectAnswer ? "Yes" : "No"}</span>,
    },
    {
        accessorKey: "allowRetake",
        header: "Allow Retake",
        cell: ({ row }) => <span>{row.original.allowRetake ? "Yes" : "No"}</span>,
    },
    {
        accessorKey: "isPublic",
        header: "Is Public",
        cell: ({ row }) => <span>{row.original.isPublic ? "Yes" : "No"}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span>{row.original.status}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Button
                variant="link"
                size="sm"
                onClick={() => onEdit(row.original)}
                className="flex items-center gap-2"
            >
                <Edit className="h-4 w-4" />
                Edit
            </Button>
        ),
        size: 5,
        minSize: 5,
        maxSize: 5,
    },
]
