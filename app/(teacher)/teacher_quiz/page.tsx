/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import Link from "next/link";

import { AlertCircle, FilePlus2, LoaderPinwheel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;

  const { data: quiz }: { data: any } = useQuery({
    queryKey: ["teacher_quiz"],
    queryFn: async () => {
      try {
        const { items } = await pocketbase_instance
          .collection("quiz")
          .getList(1, 50, { filter: `teacher_id = '${user!.id}'` });

        return items;
      } catch (err) {
        console.error(err);
        return err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (quiz) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold">Your quizzes</h1>
          <Link
            href={"/add_quiz"}
            className="btn btn-soft btn-success flex flex-row gap-4"
          >
            <FilePlus2 size={24} className="cursor-pointer" />
            <p>Create new quiz</p>
          </Link>
        </div>
        {quiz!.length == 0 && (
          <div className="flex flex-col gap-4 items-center justify-center flex-1">
            <AlertCircle size={72} />
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold">No quizzes found.</h1>
              <p className="text-gray-400">
                Get started on creating one by clicking the icon at upper-right.
              </p>
            </div>
          </div>
        )}
        {quiz!.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {quiz.map((quiz: any) => (
              <Link
                href={`/teacher_quiz/${quiz.id}`}
                className="bg-gray-50 border border-gray-300 shadow-md p-6 rounded-3xl gap-2 flex flex-col gap-4 transition-all delay-0 duration-300 hover:-translate-y-2"
                key={quiz.id}
              >
                <div className="flex flex-col gap-2">
                  <h1 className="font-bold text-xl">{quiz.title}</h1>
                  {quiz.course && (
                    <p className="px-6 py-2 bg-gray-200 text-gray-500 w-fit rounded-3xl">
                      {quiz.course}
                    </p>
                  )}
                </div>
                <p className="text-gray-400">{quiz.description}</p>
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
