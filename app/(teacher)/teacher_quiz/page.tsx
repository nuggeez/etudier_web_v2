/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import Link from "next/link";

import { AlertCircle, FilePlus2, LoaderPinwheel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;
  const [index, setIndex] = useState(0);

  const { data: quiz }: { data: any } = useQuery({
    queryKey: ["teacher_quiz"],
    queryFn: async () => {
      try {
        const { items } = await pocketbase_instance
          .collection("quiz")
          .getList(1, 50, { filter: `teacher_id = '${user!.id}'` });

        console.log(items);

        return items;
      } catch (err) {
        console.error(err);
        return err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const { data: submissions, refetch }: { data: any; refetch: any } = useQuery({
    queryKey: ["teacher_quiz_submissions", quiz],
    queryFn: async () => {
      if (quiz) {
        try {
          const allSubmissions = await Promise.all(
            quiz.map(async (record: any) => {
              try {
                const { items } = await pocketbase_instance
                  .collection("users_quiz_submissions")
                  .getList(1, 50, {
                    filter: `quiz_id = '${record.id}'`,
                    expand: "quiz_id, user_id",
                  });

                return items;
              } catch (err) {
                console.log(err);
                return []; // If one call fails, return empty array
              }
            })
          );

          // Flatten the array of arrays
          const flattened = allSubmissions.flat();

          console.log(flattened);

          return flattened;
        } catch (err) {
          console.error(err);
          throw err;
        }
      } else {
        return []; // No quiz yet, safe fallback
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!quiz,
  });

  const pages = [
    <>
      {quiz && (
        <>
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
                  Get started on creating one by clicking the icon at
                  upper-right.
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
        </>
      )}
    </>,
    <>
      {submissions && (
        <>
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-3xl font-bold">Submissions on your quizzes</h1>
          </div>
          {submissions!.length == 0 && (
            <div className="flex flex-col gap-4 items-center justify-center flex-1">
              <AlertCircle size={72} />
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">
                  No submissions on your quizzes.
                </h1>
              </div>
            </div>
          )}
          {submissions!.length > 0 && (
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Percent</th>
                    <th>Quiz name</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission: any, index: any) => (
                    <tr key={submission.id}>
                      <th>{index}</th>
                      <td>{submission.expand.user_id.name}</td>
                      <td>{submission.score}</td>
                      <td>{submission.percent}</td>
                      <td>{submission.expand.quiz_id.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>,
  ];

  if (quiz) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="flex flex-row gap-4 items-center ">
          <button
            className="btn btn-soft btn-neutral"
            onClick={() => {
              setIndex(0);
            }}
          >
            Quizzes
          </button>
          <button
            className="btn btn-soft btn-neutral"
            onClick={() => {
              refetch();
              setIndex(1);
            }}
          >
            Scores
          </button>
        </div>
        {pages[index]}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4 items-center justify-center">
      <LoaderPinwheel className="animate-spin" size={64} />
    </main>
  );
}
