"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2 } from "lucide-react"

const capabilities = [
    {
        title: "Vulnerability Management",
        items: [
            "Real-time CVE tracking and monitoring",
            "CVSS scoring and severity assessment",
            "Vulnerability enrichment with CWE data",
            "Exploit availability tracking",
        ],
    },
    {
        title: "Threat Intelligence",
        items: [
            "Malicious IP detection and blocking",
            "IOC (Indicators of Compromise) analysis",
            "Threat actor tracking",
            "Attack pattern recognition",
        ],
    },
    {
        title: "Operational Security",
        items: [
            "Automated threat alerts",
            "Custom workflow automation",
            "Integration with security tools",
            "Compliance reporting",
        ],
    },
]

export default function CapabilitiesSection() {
    const [visibleItems, setVisibleItems] = useState<number[]>([])
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        capabilities.forEach((_, capIndex) => {
                            capabilities[capIndex].items.forEach((_, itemIndex) => {
                                setTimeout(
                                    () => {
                                        setVisibleItems((prev) => [...new Set([...prev, capIndex * 10 + itemIndex])])
                                    },
                                    (capIndex * 4 + itemIndex) * 50,
                                )
                            })
                        })
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 },
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section id="capabilities" ref={sectionRef} className="relative px-4 py-20 sm:py-32">
    <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
    <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-slate-900">Comprehensive Capabilities</h2>
    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Everything you need to manage vulnerabilities and threats effectively
    </p>
    </div>

    {/* Capabilities Grid */}
    <div className="grid md:grid-cols-3 gap-8">
        {capabilities.map((capability, capIndex) => (
                <div
                    key={capIndex}
            className="rounded-xl border border-blue-100 bg-white p-8 hover:shadow-lg transition-shadow duration-300"
            >
            <h3 className="mb-6 text-xl font-semibold text-slate-900">{capability.title}</h3>
                <ul className="space-y-4">
            {capability.items.map((item, itemIndex) => {
                    const isVisible = visibleItems.includes(capIndex * 10 + itemIndex)
                    return (
                        <li
                            key={itemIndex}
                    className={`flex items-start gap-3 transition-all duration-500 ${
                        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                >
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                        </li>
                )
                })}
            </ul>
            </div>
))}
    </div>
    </div>
    </section>
)
}
