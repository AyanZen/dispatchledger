"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import MotionBackground from "@/components/layout/MotionBackground";
import LoginScreen from "@/components/auth/LoginScreen";
import LoadingScreen from "@/components/layout/LoadingScreen";

function LoginContent() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fp-app">
        <MotionBackground />
        <LoadingScreen />
      </div>
    );
  }

  async function handleLogin(email, password) {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (!result) return "Login failed.";
    if (result.error) {
      if (result.status === 429) return "Too many login attempts. Please try again in 15 minutes.";
      return "Invalid email or password.";
    }

    router.replace("/dashboard");
    router.refresh();
    return null;
  }

  return (
    <div className="fp-app">
      <MotionBackground />
      <LoginScreen onLogin={handleLogin} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fp-app">
        <MotionBackground />
        <LoadingScreen />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
