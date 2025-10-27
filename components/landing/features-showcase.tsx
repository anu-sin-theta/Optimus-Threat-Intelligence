"use client"

import { useEffect, useRef, useState } from "react"

interface MousePosition {
    x: number
    y: number
}

const features = [
    {
        title: "Multi-Source Aggregation",
        description: "Centralize data from NVD, CISA KEV, MITRE ATT&CK, ThreatFox, and more in one unified platform.",
        icon: "🔗",
        color: "from-blue-500 to-blue-600",
    },
    {
        title: "Real-time Threat Detection",
        description:
            "Get instant alerts on new vulnerabilities, malicious IPs, and emerging threats as they're discovered.",
        icon: "⚡",
        color: "from-cyan-500 to-blue-500",
    },
    {
        title: "Advanced Analytics",
        description: "Visualize threat trends, vulnerability patterns, and risk metrics with interactive dashboards.",
        icon: "📊",
        color: "from-blue-600 to-indigo-600",
    },
    {
        title: "Vulnerability Enrichment",
        description: "Enrich CVE data with CVSS scores, CWE classifications, and real-world exploit information.",
        icon: "🔍",
        color: "from-indigo-500 to-blue-600",
    },
    {
        title: "Automation & Workflows",
        description: "Automate threat response with customizable workflows and integration capabilities.",
        icon: "⚙️",
        color: "from-blue-500 to-cyan-500",
    },
    {
        title: "Comprehensive Coverage",
        description: "Monitor vulnerabilities, malicious IPs, cyber news, and attack techniques in one place.",
        icon: "🛡️",
        color: "from-cyan-600 to-blue-600",
    },
]

export default function FeaturesShowcase({ mousePosition }: { mousePosition: MousePosition }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const moveX = mousePosition.x * 0.005
        const moveY = mousePosition.y * 0.005

        containerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, [mousePosition])

    return (
        <section className="relative py-24 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Powerful Features for Threat Intelligence
                    </h2>
                    <p className="text-xl text-slate-600">
                        Everything you need to centralize, analyze, and act on vulnerability intelligence
                    </p>
                </div>

                <div ref={containerRef} className="transition-transform duration-300 ease-out">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-300 h-full">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                                    {hoveredIndex === index && (
                                        <div
                                            className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${feature.color} rounded-r-xl`}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
