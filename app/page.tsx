"use client";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError("");
    setLoading(true);
    const res =
      mode === "signup"
        ? await signUp.email({ name: form.name, email: form.email, password: form.password })
        : await signIn.email({ email: form.email, password: form.password });
    setLoading(false);
    if (res.error) setError(res.error.message || "Something went wrong");
    else router.push("/dashboard");
  }

  return (
    <section className="auth">
      <div className="auth__left">
        <div className="logo"><span className="dot">🛢</span> OilTrack</div>
        <div className="auth__pitch">
          <div className="eyebrow">Oil Change Reminder System</div>
          <h1>Never let a customer miss an oil change again.</h1>
          <p>Track every vehicle&apos;s mileage and service date in one place, and send WhatsApp reminders the moment a car is due.</p>
        </div>
        <div className="auth__meta">
          <div><div className="n">340+</div><div className="l">Vehicles tracked</div></div>
          <div><div className="n">1,200</div><div className="l">Reminders sent</div></div>
          <div><div className="n">96%</div><div className="l">Return rate</div></div>
        </div>
      </div>

      <div className="auth__right">
        <div className="formcard">
          <h2>{mode === "signup" ? "Create your account" : "Sign in"}</h2>
          <p className="sub">
            {mode === "signup" ? "Set up your shop in under a minute." : "Welcome back. Manage your clients and reminders."}
          </p>

          {mode === "signup" && (
            <div className="field">
              <label>Shop name</label>
              <input type="text" placeholder="e.g. Your Auto Shop" value={form.name} onChange={set("name")} />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@shop.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} />
          </div>

          <button className="btn btn--primary" onClick={submit} disabled={loading}>
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {error && <p className="msg msg--err">{error}</p>}

          <p className="switch">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <a onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </a>
          </p>
        </div>
      </div>

      <div className="credit">
        Photo: <a href="https://unsplash.com/@timmossholder" target="_blank" rel="noopener noreferrer">Tim Mossholder</a> / Unsplash
      </div>
    </section>
  );
}