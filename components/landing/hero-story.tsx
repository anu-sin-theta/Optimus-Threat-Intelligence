"use client"

import { useEffect, useRef } from "react"

interface MousePosition {
    x: number
    y: number
}

export default function HeroStory({ mousePosition }: { mousePosition: MousePosition }) {
    const parallaxRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!parallaxRef.current) return

        const moveX = mousePosition.x * 0.02
        const moveY = mousePosition.y * 0.02

        parallaxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, [mousePosition])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <div ref={parallaxRef} className="transition-transform duration-300 ease-out">
                    <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                        Threats Don't Wait.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Neither Should You.
            </span>
                    </h1>
                </div>

                <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                    In a world where vulnerabilities emerge every second, fragmented intelligence is your greatest weakness.
                    Optimus brings clarity to chaos—centralizing threat data from every corner of the internet into one unified,
                    actionable platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200">
                        Start Your Journey
                    </button>
                    <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300">
                        See It In Action
                    </button>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    )
}
