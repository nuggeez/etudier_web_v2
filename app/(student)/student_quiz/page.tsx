/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import Link from "next/link";

import { ArrowUp, LoaderPinwheel, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const [searchBarVisibility, setSearchBarVisibility] = useState(false);
  const [query, setQuery] = useState("");

  const { data: quiz }: { data: any } = useQuery({
    queryKey: ["student_quiz"],
    queryFn: async () => {
      try {
        const { items } = await pocketbase_instance
          .collection("quiz")
          .getList(1, 50, { filter: "visible = 1" });

        return items;
      } catch (err) {
        return err;
      }
    },
  });

  const {
    data: searchQueryResults,
    refetch: searchQuery,
  }: { data: any; error: any; refetch: any } = useQuery({
    initialData: [],
    queryKey: ["quiz_search_query", query],
    enabled: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const records = await pocketbase_instance
          .collection("quiz")
          .getList(1, 50, { filter: `title ~ '${query}' && visible = 1` });

        console.log(records);

        return records.items;
      } catch (err) {
        return err;
      }
    },
  });

  if (quiz) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold">Quiz</h1>
          {!searchBarVisibility ? (
            <Search
              size={24}
              className="cursor-pointer"
              onClick={() => setSearchBarVisibility((prevState) => !prevState)}
            />
          ) : (
            <ArrowUp
              size={24}
              className="cursor-pointer"
              onClick={() => setSearchBarVisibility((prevState) => !prevState)}
            />
          )}
        </div>
        {searchBarVisibility && (
          <div className="flex flex-row gap-4 items-center">
            <label className="floating-label flex-1">
              <span>Search</span>
              <input
                type="text"
                placeholder="Search for modules"
                className="input input-md w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <Search
              size={24}
              color="#242424"
              className="cursor-pointer"
              onClick={searchQuery}
            />
          </div>
        )}
        {searchBarVisibility && searchQueryResults.length > 0 && (
          <>
            <div>
              <h1 className="text-gray-400">Searched for</h1>
              <h1 className="font-bold">{query}</h1>
            </div>
            {searchQueryResults.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {searchQueryResults.map((quiz: any) => (
                  <Link
                    href={`/student_quiz/${quiz.id}`}
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
            {searchQueryResults.length == 0 && <h1>No results.</h1>}
          </>
        )}
        {!searchBarVisibility && quiz && quiz!.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {quiz.map((quiz: any) => (
              <Link
                href={`/student_quiz/${quiz.id}`}
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
