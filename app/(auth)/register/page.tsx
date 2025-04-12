"use client";

import pocketbase_instance from "@/app/lib/pocketbase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState(""); // "Student" or "Teacher"
  const [school, setSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = () => {
    if (!email || !password || !name || !type || !school) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await pocketbase_instance.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
        account_type: type,
        school,
      });

      const { record, token } = await pocketbase_instance
        .collection("users")
        .authWithPassword(email, password);

      localStorage.setItem(
        "pocketbase_auth",
        JSON.stringify({ record, token })
      );

      if (token && type == "Student") {
        router.replace("/student_dashboard");
      }

      if (token && type == "Teacher") {
        router.replace("/teacher_dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const user = JSON.parse(localStorage.getItem("pocketbase_auth")!);

      if (user && user.record.account_type == "Student") {
        router.replace("/student_dashboard/");
      } else if (user && user.record.account_type == "Teacher") {
        router.replace("/teacher_dashboard/");
      }
    };

    checkSession();
  }, []);

  return (
    <main className="flex flex-col min-h-screen max-w-3xl justify-center mx-auto px-4">
      <div className="flex flex-row bg-zinc-100 border border-gray-200 shadow rounded-3xl p-8 gap-8 items-center">
        <div className="basis-[50%] flex flex-col gap-2">
          <h1 className="text-5xl font-black">etudier</h1>
          <p>
            Your tasks, notes, and quizzes are waiting. Sign in to pick up where
            you left off—or join thousands of learners and doers who organize
            smarter every day.
          </p>
        </div>

        <div className="basis-[50%] flex flex-col gap-4">
          <h1 className="font-black text-xl">Register</h1>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <input
            className="input validator"
            type="text"
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input validator"
            type="text"
            required
            placeholder="School"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />

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

          <div className="flex flex-row gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                className="radio"
                checked={type === "Student"}
                onChange={() => setType("Student")}
              />
              Student
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                className="radio"
                checked={type === "Teacher"}
                onChange={() => setType("Teacher")}
              />
              Teacher
            </label>
          </div>

          <Link className="text-blue-600 underline text-sm" href={"/"}>
            Already have an account?
          </Link>

          <button
            className="btn btn-soft btn-dash btn-success btn-md"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    </main>
  );
}
