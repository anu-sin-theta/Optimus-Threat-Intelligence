"use client"

import { useEffect, useRef } from "react"

interface MousePosition {
    x: number
    y: number
}

export default function TheProblem({ mousePosition }: { mousePosition: MousePosition }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const moveX = mousePosition.x * 0.01
        const moveY = mousePosition.y * 0.01

        containerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, [mousePosition])

    return (
        <section className="relative py-24 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div ref={containerRef} className="transition-transform duration-300 ease-out">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl blur-2xl opacity-30"></div>
                            <div className="relative bg-white rounded-2xl p-8 border border-slate-200">
                                <div className="text-5xl font-bold text-red-500 mb-4">⚠️</div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h3>
                                <ul className="space-y-3 text-slate-600">
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 font-bold mt-1">•</span>
                                        <span>Vulnerability data scattered across dozens of disconnected sources</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 font-bold mt-1">•</span>
                                        <span>Manual correlation takes hours, leaving you exposed</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 font-bold mt-1">•</span>
                                        <span>Missing critical context on emerging threats</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 font-bold mt-1">•</span>
                                        <span>No unified view of your attack surface</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            Your Security Team is Drowning in Data
                        </h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Every day, thousands of new vulnerabilities are discovered. Threat actors are weaponizing them within
                            hours. Your team is manually piecing together intelligence from NVD, CISA, MITRE, and dozens of other
                            sources—wasting precious time that should be spent on defense.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            The result? Blind spots. Delayed responses. Increased risk.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
