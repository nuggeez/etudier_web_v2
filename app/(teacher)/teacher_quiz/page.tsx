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
          <Link href={"/add_quiz"}>
            <FilePlus2 size={24} className="cursor-pointer" />
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
          <div className="overflow-x-auto bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz ID</th>
                  <th>Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {quiz.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/teacher_quiz/${item.id}`}>
                        <h1 className="font-bold">{item.id}</h1>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/teacher_quiz/${item.id}`}>
                        <h1 className="">{item.title}</h1>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/teacher_quiz/${item.id}`}>
                        <p className="text-sm text-wrap text-ellipsis">
                          {item.description}
                        </p>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
