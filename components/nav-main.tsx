"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"

type NavItem = {
	title: string
	url: string
	icon: React.ElementType
}

export function NavMain({ items }: { items: NavItem[] }) {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<aside className="w-full">
			<nav className="space-y-2">
				{items.map((item) => {
					const Icon = item.icon
					return (
						<button
							key={item.url}
							onClick={() => {
								router.push(item.url)
							}}
							className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
								pathname.startsWith(item.url) && (pathname.length === item.url.length || pathname[item.url.length] === '/')
									? 'bg-primary text-primary-foreground'
									: 'hover:bg-muted text-foreground'
							}`}
						>
							<div className="flex items-center gap-2"> 
								<Icon className="h-4 w-4" />
								<span className="font-medium">{item.title}</span>
							</div>
						</button>
					)
				})}
			</nav>
        </aside>
	)
}
