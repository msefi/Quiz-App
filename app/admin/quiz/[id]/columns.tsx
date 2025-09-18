"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export type Question = {
    id: number
    text: string
    correctAnswer: string
    incorrectAnswers: string[]
    quizId: number
}

export const columns = (onEdit: (question: Question) => void): ColumnDef<Question>[] => [
    {
        accessorKey: "text",
        header: "Question",
    },
    {
        accessorKey: "correctAnswer",
        header: "Correct Answer",
        cell: ({ row }) => (
            <Badge>
                {row.original.correctAnswer}
            </Badge>
        ),
    },
    {
        accessorKey: "incorrectAnswers",
        header: "Incorrect Answers",
        cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.incorrectAnswers.map((answer, index) => (
                        <Badge key={index} variant="outline" className="flex justify-center">
                            {answer}
                        </Badge>
                    ))}
                </div>
        ),
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
