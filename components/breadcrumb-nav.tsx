import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CircleArrowLeft } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbNavProps {
    items: BreadcrumbItem[]
    title?: string
    backHref?: string
}

export function BreadcrumbNav({ items, title, backHref }: BreadcrumbNavProps) {
    return (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 shadow-md border border-blue-100">
            <div className="flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList className="text-sm">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                                <BreadcrumbItem className="flex items-center gap-2">
                                    <span className="font-medium text-blue-700">
                                        {item.label}
                                    </span>
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {title && (
                <div className="mt-4 flex items-center gap-3">
                    {backHref && (
                        <Link href={backHref} className="text-blue-600 hover:text-blue-800 transition-colors">
                            <CircleArrowLeft className="h-6 w-6" />
                        </Link>
                    )}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                        {title}
                    </h1>
                </div>
            )}
        </div>
    )
}
