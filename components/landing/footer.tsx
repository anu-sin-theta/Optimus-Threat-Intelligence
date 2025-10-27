"use client"

import Link from "next/link"
import { Shield } from "lucide-react"

export default function LandingFooter() {
    return (
        <footer className="border-t border-blue-100 bg-white px-4 py-12 sm:py-16">
            <div className="mx-auto max-w-6xl">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">Optimus</span>
                        </Link>
                        <p className="text-sm text-slate-600">Centralized vulnerability intelligence platform</p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#features" className="text-sm text-slate-600 hover:text-blue-600">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#sources" className="text-sm text-slate-600 hover:text-blue-600">
                                    Data Sources
                                </Link>
                            </li>
                            <li>
                                <Link href="#capabilities" className="text-sm text-slate-600 hover:text-blue-600">
                                    Capabilities
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                                    API Reference
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-blue-100 pt-8 flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-slate-600">© 2025 Optimus. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 sm:mt-0">
                        <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                            Twitter
                        </Link>
                        <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                            GitHub
                        </Link>
                        <Link href="#" className="text-sm text-slate-600 hover:text-blue-600">
                            LinkedIn
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
