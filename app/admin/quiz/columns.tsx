"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export type Quiz = {
    id: string
    name: string
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
