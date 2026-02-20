"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-9 h-9" /> // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => {
                console.log("Toggle clicked! Current theme:", theme)
                setTheme(theme === "dark" ? "light" : "dark")
            }}
            className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300",
                className
            )}
            {...props}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-900 dark:text-slate-400" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-900 dark:text-slate-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
