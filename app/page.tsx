/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import pocketbase_instance from "@/app/lib/pocketbase";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderPinwheel } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isInitialized, setIsInitialized] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { record, token } = await pocketbase_instance
        .collection("users")
        .authWithPassword(email, password);

      localStorage.setItem(
        "pocketbase_auth",
        JSON.stringify({ record, token })
      );

      if (record!.account_type == "Student") {
        router.replace("/student_dashboard");
      } else if (record!.account_type == "Teacher") {
        router.replace("/teacher_dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const user = JSON.parse(localStorage.getItem("pocketbase_auth")!);

      if (user && user.record.account_type == "Student") {
        router.replace("/student_dashboard/");
        return;
      } else if (user && user.record.account_type == "Teacher") {
        router.replace("/teacher_dashboard/");
        return;
      }

      setIsInitialized(true);
    };

    checkSession();
  }, []);

  if (isInitialized) {
    return (
      <main className="flex flex-col min-h-screen max-w-3xl justify-center mx-auto px-4">
        <div className="flex flex-row bg-zinc-100 border border-gray-200 shadow rounded-3xl p-8 gap-8 items-center">
          <div className="basis-[50%] flex flex-col gap-2">
            <h1 className="text-5xl font-black">etudier</h1>
            <p>
              Your tasks, notes, and quizzes are waiting. Sign in to pick up
              where you left off—or join thousands of learners and doers who
              organize smarter every day.
            </p>
          </div>

          <form className="basis-[50%] flex flex-col gap-4">
            <h1 className="font-black text-xl">Login</h1>

            <input
              className="input validator"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input validator"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Link className="text-blue-600 underline text-sm" href="/register">
              Don&apos;t have an account?
            </Link>

            {error && (
              <p className="text-red-500 text-sm p-4 rounded-3xl bg-gray-200">
                {error}
              </p>
            )}

            <button
              className="btn btn-soft btn-dash btn-success btn-md"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4 items-center justify-center">
      <LoaderPinwheel className="animate-spin" size={64} />
    </main>
  );
}
