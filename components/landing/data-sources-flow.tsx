"use client"

import { useEffect, useRef } from "react"

interface MousePosition {
    x: number
    y: number
}

const sources = [
    { name: "NVD", icon: "📋" },
    { name: "CISA KEV", icon: "🚨" },
    { name: "MITRE ATT&CK", icon: "🎯" },
    { name: "ThreatFox", icon: "🦊" },
    { name: "AbuseIPDB", icon: "🔴" },
    { name: "Cyber News", icon: "📰" },
    { name: "CWE", icon: "⚠️" },
    { name: "More...", icon: "+" },
]

export default function DataSourcesFlow({ mousePosition }: { mousePosition: MousePosition }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const moveX = mousePosition.x * 0.008
        const moveY = mousePosition.y * 0.008

        containerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, [mousePosition])

    return (
        <section className="relative py-24 px-6 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Intelligence From Every Source</h2>
                    <p className="text-xl text-slate-600">
                        Optimus aggregates data from the world's most authoritative threat intelligence sources
                    </p>
                </div>

                <div ref={containerRef} className="transition-transform duration-300 ease-out">
                    <div className="relative">
                        {/* Central hub */}
                        <div className="flex justify-center mb-12">
                            <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <div className="text-white font-bold text-sm">Optimus</div>
                                </div>
                            </div>
                        </div>

                        {/* Sources grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {sources.map((source, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center hover:border-blue-600 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {source.icon}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-slate-700 text-center">{source.name}</p>
                                </div>
                            ))}
                        </div>

                        {/* Connection lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: "-50px" }}>
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    )
}
