"use client"

import { useEffect, useRef, useState } from "react"

const dataSources = [
    { name: "NVD", description: "National Vulnerability Database" },
    { name: "CISA KEV", description: "Known Exploited Vulnerabilities" },
    { name: "MITRE ATT&CK", description: "Adversary Tactics & Techniques" },
    { name: "ThreatFox", description: "Malware IOC Intelligence" },
    { name: "AbuseIPDB", description: "Malicious IP Database" },
    { name: "RedHat", description: "Security Advisories" },
    { name: "Cyber News", description: "Real-time Threat News" },
    { name: "CWE", description: "Common Weakness Enumeration" },
]

export default function DataSourcesSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
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
        <section
            id="sources"
            ref={sectionRef}
            className="relative px-4 py-20 sm:py-32 bg-gradient-to-b from-white to-blue-50"
        >
            <div className="mx-auto max-w-6xl">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-slate-900">Integrated Data Sources</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Connect to authoritative threat intelligence sources for comprehensive coverage
                    </p>
                </div>

                {/* Data Sources Grid */}
                <div
                    className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
                >
                    {dataSources.map((source, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-lg border border-blue-100 bg-white p-6 text-center transition-all duration-500 hover:shadow-md hover:border-blue-300 hover:scale-105 ${
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                            style={{ transitionDelay: `${index * 50}ms` }}
                        >
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <h3 className="font-semibold text-slate-900 mb-1">{source.name}</h3>
                                <p className="text-sm text-slate-600">{source.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
