import Link from "next/link";
import pocketbase_instance from "@/app/lib/pocketbase";

import { CircleUserRound, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeaderNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("pocketbase_auth");
    pocketbase_instance.authStore.clear();
    router.replace("/");
  };

  return (
    <header className="flex flex-row gap-4 items-center justify-between py-4 px-8 bg-gray-50 border border-gray-300 shadow rounded-3xl">
      <Link
        href={"/teacher_dashboard/"}
        className="flex flex-row gap-4 items-center"
      >
        <h1 className="text-2xl font-bold">etudier</h1>
      </Link>

      <nav className="flex flex-row gap-8">
        <Link href={"/teacher_dashboard"} className="cursor-pointer">
          Home
        </Link>
        <Link href={"/teacher_modules"} className="cursor-pointer">
          Modules
        </Link>
        <Link href={"/teacher_quiz"} className="cursor-pointer">
          Quiz
        </Link>
      </nav>

      <nav className="flex flex-row gap-8">
        <Link href={"/teacher_profile"}>
          <CircleUserRound size={24} />
        </Link>
        <LogOut size={24} className="cursor-pointer" onClick={handleLogout} />
      </nav>
    </header>
  );
}
