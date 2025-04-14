/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import Link from "next/link";

import { AlertCircle, FilePlus2, LoaderPinwheel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;

  const { data: modules }: { data: any } = useQuery({
    queryKey: ["teacher_modules"],
    queryFn: async () => {
      try {
        const { items } = await pocketbase_instance
          .collection("modules")
          .getList(1, 50, {
            filter: `teacher_id = '${user.id}'`,
          });

        const temp: any[] = [];

        items.forEach((record) => {
          temp.push({
            ...record,
            thumbnail_url: pocketbase_instance.files.getURL(
              record,
              record.thumbnail
            ),
          });
        });

        return temp;
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        return error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (modules) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold">Your modules</h1>
          <Link
            href={"/add_module"}
            className="btn btn-soft btn-success flex flex-row gap-4"
          >
            <FilePlus2 size={24} className="cursor-pointer" />
            <p>Create new module</p>
          </Link>
        </div>
        {modules!.length == 0 && (
          <div className="flex flex-col gap-4 items-center justify-center flex-1">
            <AlertCircle size={72} />
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">No modules found.</h1>
              <p className="text-gray-400">
                Get started on creating one by clicking the icon at upper-right.
              </p>
            </div>
          </div>
        )}
        {modules && modules!.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {modules.map((module: any) => (
              <Link
                href={`/teacher_modules/${module.id}`}
                className="bg-gray-50 border border-gray-300 shadow-md p-6 rounded-3xl gap-2 flex flex-col transition-all delay-0 duration-300 hover:-translate-y-2"
                key={module.id}
              >
                <img
                  src={
                    module.thumbnail_url ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg_ITtT5GMZ-5j9ybW17fpwAOm3Lg0hdzNcw&s"
                  }
                  className="aspect-square w-full bg-gray-200 rounded-3xl border-0 object-cover"
                />
                <h1 className="font-bold text-xl">{module.title}</h1>
                {module.course && (
                  <p className="px-6 py-2 bg-gray-200 text-gray-500 w-fit rounded-3xl">
                    {module.course}
                  </p>
                )}
                <p className="text-gray-400">{module.description}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4 items-center justify-center">
      <LoaderPinwheel className="animate-spin" size={64} />
    </main>
  );
}
