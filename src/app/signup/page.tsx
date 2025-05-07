"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/usercontext";
import { addData } from "@/hooks/useDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useUser();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const { user: updatedUser, error } = await signUp(email, password);
            if (error) {
                toast.error(error.message);
                return;
            }

            if (updatedUser) {
                await addData(`users/${updatedUser.uid}`, {
                    email,
                    photoURL: "",
                    displayName: name,
                    createdAt: Timestamp.fromDate(new Date())
                });
                toast.success("Account created successfully");
                router.push("/");
            }
        } catch (error) {
            console.error("Error during signup:", error);
            toast.error("An error occurred during signup");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        required
                    />
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>
            </div>
        </main>
    );
} 