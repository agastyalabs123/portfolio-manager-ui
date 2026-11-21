import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <span className="auth-brand"><span className="brand-mark"><span /></span>orbit<span className="brand-dot">.</span></span>
        <p>One view for your Solana, EVM, and Sui assets.</p>
      </div>
      <Suspense fallback={<div className="auth-loading">Loading sign in…</div>}>
        <SignIn />
      </Suspense>
    </main>
  );
}
