"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import MotionBackground from "@/components/layout/MotionBackground";
import LoginScreen from "@/components/auth/LoginScreen";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useTheme } from "@/hooks/useTheme";
import { usePortal } from "@/components/providers/PortalProvider";

function LoginContent() {
  const router = useRouter();
  const { loading, currentUser, handleLogin } = usePortal();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace("/dashboard");
    }
  }, [loading, currentUser, router]);

  if (loading) {
    return (
      <div className="fp-app">
        <MotionBackground />
        <LoadingScreen />
      </div>
    );
  }

  if (currentUser) return null;

  return (
    <div className="fp-app">
      <MotionBackground />
      <LoginScreen onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />
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
