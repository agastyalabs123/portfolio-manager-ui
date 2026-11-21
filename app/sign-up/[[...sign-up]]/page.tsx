import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <span className="auth-brand"><span className="brand-mark"><span /></span>orbit<span className="brand-dot">.</span></span>
        <p>Create an account to access your portfolio workspace.</p>
      </div>
      <Suspense fallback={<div className="auth-loading">Loading sign up…</div>}>
        <SignUp />
      </Suspense>
    </main>
  );
}
