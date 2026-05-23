"use client";

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { LayoutDashboard, Sprout } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [isSignup, setIsSignup] = React.useState(false)
    
    // Login state
    const [loginEmail, setLoginEmail] = React.useState("")
    const [loginPassword, setLoginPassword] = React.useState("")
    const [loginLoading, setLoginLoading] = React.useState(false)
    const [loginError, setLoginError] = React.useState("")

    // Signup state
    const [signupData, setSignupData] = React.useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phone: "",
        farmName: "",
        farmLocation: "",
        farmDescription: "",
    })
    const [signupLoading, setSignupLoading] = React.useState(false)
    const [signupError, setSignupError] = React.useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginLoading(true)
        setLoginError("")

        try {
            const response = await api.post('/auth/login', { email: loginEmail, password: loginPassword })
            const { accessToken, user } = response.data

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('user', JSON.stringify(user))

            router.push('/dashboard')
        } catch (err: any) {
            console.error('Login failed', err)
            setLoginError(err.response?.data?.message || 'Invalid email or password')
        } finally {
            setLoginLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setSignupLoading(true)
        setSignupError("")

        const { email, password, confirmPassword, name, phone, farmName, farmLocation, farmDescription } = signupData

        if (password !== confirmPassword) {
            setSignupError("Passwords do not match")
            setSignupLoading(false)
            return
        }

        try {
            const response = await api.post('/auth/register-with-farm', {
                email,
                password,
                name,
                phone,
                farmName,
                farmLocation,
                farmDescription,
            })
            const { accessToken, user } = response.data

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('user', JSON.stringify(user))

            router.push('/dashboard')
        } catch (err: any) {
            console.error('Signup failed', err)
            setSignupError(err.response?.data?.message || 'Registration failed')
        } finally {
            setSignupLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
            <Card className="w-full max-w-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-emerald-100 rounded-full dark:bg-emerald-900/30">
                            {isSignup ? (
                                <Sprout className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <LayoutDashboard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            )}
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">
                        {isSignup ? "Create your farm" : "Welcome back"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSignup 
                            ? "Register and set up your dairy farm in one step"
                            : "Enter your credentials to access your farm"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                            <button
                                onClick={() => setIsSignup(false)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    !isSignup 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsSignup(true)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isSignup 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {!isSignup ? (
                        // Login Form
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="owner@example.com"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {loginError && (
                                <p className="text-sm text-red-600 dark:text-red-400 text-center">{loginError}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={loginLoading}>
                                {loginLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    ) : (
                        // Signup Form
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <Input
                                        id="signup-name"
                                        placeholder="Rajesh Patil"
                                        value={signupData.name}
                                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="owner@example.com"
                                        value={signupData.email}
                                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-phone">Phone (Optional)</Label>
                                <Input
                                    id="signup-phone"
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    value={signupData.phone}
                                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="••••••••••"
                                        value={signupData.password}
                                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                                    <Input
                                        id="signup-confirm-password"
                                        type="password"
                                        placeholder="••••••••••"
                                        value={signupData.confirmPassword}
                                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-farm-name">Farm Name *</Label>
                                <Input
                                    id="signup-farm-name"
                                    placeholder="Green Valley Dairy Farm"
                                    value={signupData.farmName}
                                    onChange={(e) => setSignupData({ ...signupData, farmName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-farm-location">Farm Location *</Label>
                                <Input
                                    id="signup-farm-location"
                                    placeholder="Pune, Maharashtra"
                                    value={signupData.farmLocation}
                                    onChange={(e) => setSignupData({ ...signupData, farmLocation: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-farm-description">Farm Description</Label>
                                <textarea
                                    id="signup-farm-description"
                                    placeholder="Describe your dairy farm..."
                                    value={signupData.farmDescription}
                                    onChange={(e) => setSignupData({ ...signupData, farmDescription: e.target.value })}
                                    className="min-h-20 w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            {signupError && (
                                <p className="text-sm text-red-600 dark:text-red-400 text-center">{signupError}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={signupLoading}>
                                {signupLoading ? "Creating account..." : "Create Account & Farm"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    {!isSignup && (
                        <div className="text-sm text-center text-slate-500">
                            Try: owner@example.com / password123
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
