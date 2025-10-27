"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <section className="relative overflow-hidden px-4 py-20 sm:py-32 lg:py-40">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100 opacity-20 blur-3xl animate-pulse" />
                <div
                    className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-50 opacity-20 blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
            </div>

            <div className="relative mx-auto max-w-4xl text-center">
                {/* Badge */}
                <div
                    className={`mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Centralized Threat Intelligence</span>
                </div>

                {/* Main Heading */}
                <h1
                    className={`mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                    Unified Vulnerability{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Intelligence</span>
                </h1>

                {/* Subheading */}
                <p
                    className={`mb-8 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: "100ms" }}
                >
                    Aggregate, analyze, and act on threat intelligence from multiple authoritative sources. Stay ahead of
                    vulnerabilities with real-time insights and comprehensive threat data.
                </p>

                {/* CTA Buttons */}
                <div
                    className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: "200ms" }}
                >
                    <Link href="/app">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            Launch Dashboard <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                        View Documentation
                    </Button>
                </div>

                {/* Stats */}
                <div
                    className={`mt-16 grid grid-cols-3 gap-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: "300ms" }}
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">10+</div>
                        <div className="text-sm text-slate-600">Data Sources</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">Real-time</div>
                        <div className="text-sm text-slate-600">Updates</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">100%</div>
                        <div className="text-sm text-slate-600">Coverage</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
