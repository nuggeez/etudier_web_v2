"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";

import { LoaderPinwheel, Search } from "lucide-react";
import { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [isInitialized, setIsInitialized] = useState(false);

  const [searchBarVisibility, setSearchBarVisibility] = useState(false);
  const [query, setQuery] = useState("");
  const [modules, setModules] = useState<RecordModel[]>();

  useEffect(() => {
    const getModules = async () => {
      const { items } = await pocketbase_instance
        .collection("modules")
        .getList(1, 50, { filter: "visible = 1" });

      setModules(items);
      setIsInitialized(true);
      console.log(items);
    };

    getModules();
  }, []);

  if (isInitialized) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold">Modules</h1>
          <Search
            size={24}
            className="cursor-pointer"
            onClick={() => setSearchBarVisibility((prevState) => !prevState)}
          />
        </div>
        {searchBarVisibility && (
          <label className="floating-label">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search for modules"
              className="input input-md w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
        {modules && modules.length > 0 && (
          <div className="flex flex-col gap-4">
            {modules.map((module) => (
              <Link
                href={`/student_modules/${module.id}`}
                key={module.id}
                className="flex flex-col p-8 border border-gray-300 shadow bg-gray-50 rounded-3xl"
              >
                <h1 className="text-3xl font-bold">{module.title}</h1>
                <p>{module.description}</p>
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
