"use client";

import { Suspense } from "react";
import { AuthForm } from "../login/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<div className="text-foreground">Loading...</div>}>
        <AuthForm defaultMode="signup" />
      </Suspense>
    </div>
  );
}
