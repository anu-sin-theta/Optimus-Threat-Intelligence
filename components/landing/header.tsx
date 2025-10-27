"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">Optimus</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                            Features
                        </Link>
                        <Link href="#sources" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                            Data Sources
                        </Link>
                        <Link href="#capabilities" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                            Capabilities
                        </Link>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="text-slate-600 hover:text-blue-600">
                            Sign In
                        </Button>
                        <Link href="/app">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
