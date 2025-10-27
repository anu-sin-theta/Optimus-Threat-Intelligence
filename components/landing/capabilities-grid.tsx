"use client"

import { useEffect, useRef } from "react"

interface MousePosition {
    x: number
    y: number
}

const capabilities = [
    {
        category: "Vulnerability Management",
        items: [
            "Real-time CVE tracking and monitoring",
            "CVSS scoring and risk assessment",
            "Exploit availability detection",
            "Patch management integration",
        ],
    },
    {
        category: "Threat Intelligence",
        items: [
            "Malicious IP detection and tracking",
            "Attack technique mapping (MITRE ATT&CK)",
            "Threat actor profiling",
            "Emerging threat alerts",
        ],
    },
    {
        category: "Operational Security",
        items: [
            "Automated threat response workflows",
            "Integration with security tools",
            "Custom alert rules and filters",
            "Compliance reporting and dashboards",
        ],
    },
]

export default function CapabilitiesGrid({ mousePosition }: { mousePosition: MousePosition }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const moveX = mousePosition.x * 0.006
        const moveY = mousePosition.y * 0.006

        containerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, [mousePosition])

    return (
        <section className="relative py-24 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Capabilities Built for Your Team</h2>
                    <p className="text-xl text-slate-600">
                        From vulnerability management to threat response, Optimus covers every aspect of threat intelligence
                    </p>
                </div>

                <div ref={containerRef} className="transition-transform duration-300 ease-out">
                    <div className="grid md:grid-cols-3 gap-8">
                        {capabilities.map((capability, index) => (
                            <div key={index} className="group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
                                <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                        {capability.category}
                                    </h3>
                                    <ul className="space-y-4">
                                        {capability.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start gap-3 text-slate-600 group/item">
                        <span className="text-blue-600 font-bold mt-1 group-hover/item:scale-125 transition-transform duration-300">
                          →
                        </span>
                                                <span className="group-hover/item:text-slate-900 transition-colors duration-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
