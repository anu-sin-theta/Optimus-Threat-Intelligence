"use client"

import { useEffect, useRef } from "react"

interface MousePosition {
    x: number
    y: number
}

export default function TheSolution({ mousePosition }: { mousePosition: MousePosition }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const moveX = mousePosition.x * 0.01
        const moveY = mousePosition.y * 0.01

        containerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, [mousePosition])

    return (
        <section className="relative py-24 px-6 bg-gradient-to-r from-blue-50 to-slate-50 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            Meet Optimus: Your Centralized Threat Intelligence Command Center
                        </h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Optimus aggregates intelligence from 8+ authoritative sources—NVD, CISA KEV, MITRE ATT&CK, ThreatFox,
                            AbuseIPDB, and more—into a single, unified platform. No more context switching. No more manual
                            correlation.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Just actionable intelligence, delivered in real-time.
                        </p>
                    </div>

                    <div ref={containerRef} className="transition-transform duration-300 ease-out">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl blur-2xl opacity-30"></div>
                            <div className="relative bg-white rounded-2xl p-8 border border-slate-200">
                                <div className="text-5xl font-bold text-blue-600 mb-4">✓</div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">The Solution</h3>
                                <ul className="space-y-3 text-slate-600">
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 font-bold mt-1">✓</span>
                                        <span>All threat intelligence in one place</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 font-bold mt-1">✓</span>
                                        <span>Real-time alerts on emerging threats</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 font-bold mt-1">✓</span>
                                        <span>Enriched vulnerability data with context</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-blue-600 font-bold mt-1">✓</span>
                                        <span>Automated threat response workflows</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
