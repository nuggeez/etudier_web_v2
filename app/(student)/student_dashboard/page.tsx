"use client";

import HeaderNavbar from "../components/HeaderNavbar";

import pocketbase_instance from "@/app/lib/pocketbase";
import { FileIcon, ListIcon, LoaderPinwheel } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record!;

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const user = JSON.parse(localStorage.getItem("pocketbase_auth")!);

      if (!user) {
        localStorage.removeItem("pocketbase_auth");
        router.replace("/");
      }

      if (user && user.record.account_type == "Student") {
        router.replace("/student_dashboard/");
      } else if (user && user.record.account_type == "Teacher") {
        router.replace("/student_dashboard/");
      }

      setIsInitialized(true);
    };

    checkSession();
  }, []);

  if (isInitialized) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <h1 className="text-3xl font-bold">Activities</h1>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={"/student_modules"}
            className="flex flex-col gap-8 p-8 border border-gray-300 shadow bg-gray-50 rounded-3xl justify-between transition-all delay-0 duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <FileIcon size={64} />
            <h1 className="text-2xl">View your modules</h1>
          </Link>
          <Link
            href={"/student_quiz"}
            className="flex flex-col gap-8 p-8 border border-gray-300 shadow bg-gray-50 rounded-3xl justify-between transition-all delay-0 duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <ListIcon size={64} />
            <h1 className="text-2xl">View your quizzes</h1>
          </Link>
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
