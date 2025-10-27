"use client"

import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export const useAuth = () => {
    const router = useRouter()

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            // Redirect to main app after successful sign in
            router.push("/")
        } catch (error) {
            console.error("Google sign in error:", error)
            throw error
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            router.push("/landing")
        } catch (error) {
            console.error("Logout error:", error)
            throw error
        }
    }

    return { signInWithGoogle, logout }
}

export const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error("Logout error:", error)
        throw error
    }
}
