"use client";

import HeaderNavbar from "../components/HeaderNavbar";

import pocketbase_instance from "@/app/lib/pocketbase";
import {
  ChartArea,
  ChartBar,
  FileIcon,
  FilePlus2,
  ListIcon,
  ListPlus,
  LoaderPinwheel,
} from "lucide-react";
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
        <h1 className="text-3xl font-bold">Recent modules accessed</h1>
        <div className="overflow-x-auto bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Module</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                          alt="Avatar Tailwind CSS Component"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Hart Hagerty</div>
                      <div className="text-sm opacity-50">United States</div>
                    </div>
                  </div>
                </td>
                <td>
                  Zemlak, Daniel and Leannon
                  <br />
                  <span className="badge badge-ghost badge-sm">
                    Desktop Support Technician
                  </span>
                </td>
                <td>Purple</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h1 className="text-3xl font-bold">Recent quiz accessed</h1>
        <div className="overflow-x-auto bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Module</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                          alt="Avatar Tailwind CSS Component"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Hart Hagerty</div>
                      <div className="text-sm opacity-50">United States</div>
                    </div>
                  </div>
                </td>
                <td>
                  Zemlak, Daniel and Leannon
                  <br />
                  <span className="badge badge-ghost badge-sm">
                    Desktop Support Technician
                  </span>
                </td>
                <td>Purple</td>
              </tr>
            </tbody>
          </table>
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
