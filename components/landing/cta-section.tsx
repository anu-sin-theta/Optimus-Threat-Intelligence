"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
    return (
        <section className="relative px-4 py-20 sm:py-32 bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl animate-pulse" />
                <div
                    className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
            </div>

            <div className="relative mx-auto max-w-4xl text-center">
                <h2 className="mb-6 text-3xl sm:text-4xl font-bold text-white">
                    Ready to Centralize Your Threat Intelligence?
                </h2>
                <p className="mb-8 text-lg text-blue-100 max-w-2xl mx-auto">
                    Join security teams worldwide who trust Optimus for comprehensive vulnerability and threat intelligence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/app">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
                            Get Started Now <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                        Schedule Demo
                    </Button>
                </div>
            </div>
        </section>
    )
}
