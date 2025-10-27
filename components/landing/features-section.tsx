"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Database, Zap, BarChart3, AlertCircle, Cpu } from "lucide-react"

const features = [
    {
        icon: Database,
        title: "Multi-Source Aggregation",
        description: "Centralize data from NVD, CISA KEV, MITRE ATT&CK, ThreatFox, and more in one unified platform.",
    },
    {
        icon: Zap,
        title: "Real-time Threat Detection",
        description:
            "Get instant alerts on new vulnerabilities, malicious IPs, and emerging threats as they're discovered.",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Visualize threat trends, vulnerability patterns, and risk metrics with interactive dashboards.",
    },
    {
        icon: AlertCircle,
        title: "Vulnerability Enrichment",
        description: "Enrich CVE data with CVSS scores, CWE classifications, and real-world exploit information.",
    },
    {
        icon: Cpu,
        title: "Automation & Workflows",
        description: "Automate threat response with customizable workflows and integration capabilities.",
    },
    {
        icon: Shield,
        title: "Comprehensive Coverage",
        description: "Monitor vulnerabilities, malicious IPs, cyber news, and attack techniques in one place.",
    },
]

export default function FeaturesSection() {
    const [visibleFeatures, setVisibleFeatures] = useState<number[]>([])
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Stagger animation for each feature
                        features.forEach((_, index) => {
                            setTimeout(() => {
                                setVisibleFeatures((prev) => [...new Set([...prev, index])])
                            }, index * 100)
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
        <section id="features" ref={sectionRef} className="relative px-4 py-20 sm:py-32">
            <div className="mx-auto max-w-6xl">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-slate-900">
                        Powerful Features for Threat Intelligence
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Everything you need to centralize, analyze, and act on vulnerability intelligence
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        const isVisible = visibleFeatures.includes(index)

                        return (
                            <div
                                key={index}
                                className={`group relative rounded-xl border border-blue-100 bg-white p-8 transition-all duration-500 hover:shadow-lg hover:border-blue-300 ${
                                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                }`}
                            >
                                {/* Hover gradient background */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative">
                                    {/* Icon */}
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
