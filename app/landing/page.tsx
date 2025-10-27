"use client"

import { useEffect, useRef, useState } from "react"
import LandingHeader from "@/components/landing/header"
import HeroStory from "@/components/landing/hero-story"
import TheProblem from "@/components/landing/the-problem"
import TheSolution from "@/components/landing/the-solution"
import FeaturesShowcase from "@/components/landing/features-showcase"
import DataSourcesFlow from "@/components/landing/data-sources-flow"
import CapabilitiesGrid from "@/components/landing/capabilities-grid"
import CTASection from "@/components/landing/cta-section"
import LandingFooter from "@/components/landing/footer"

export default function LandingPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                })
            }
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 overflow-hidden"
        >
            <LandingHeader />
            <HeroStory mousePosition={mousePosition} />
            <TheProblem mousePosition={mousePosition} />
            <TheSolution mousePosition={mousePosition} />
            <FeaturesShowcase mousePosition={mousePosition} />
            <DataSourcesFlow mousePosition={mousePosition} />
            <CapabilitiesGrid mousePosition={mousePosition} />
            <CTASection />
            <LandingFooter />
        </div>
    )
}
