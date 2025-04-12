"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import Link from "next/link";

import { useEffect, useState } from "react";
import { RecordModel } from "pocketbase";
import { AlertCircle, FilePlus2, LoaderPinwheel } from "lucide-react";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;
  const [isInitialized, setIsInitialized] = useState(false);

  const [modules, setModules] = useState<RecordModel[]>([]);

  useEffect(() => {
    const getModules = async () => {
      const { items } = await pocketbase_instance
        .collection("modules")
        .getList(1, 50, { filter: `teacher_id = '${user!.id}'` });

      if (items.length > 0) {
        setModules(items);
      }

      setIsInitialized(true);
    };

    getModules();
  }, []);

  if (isInitialized) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold">Your modules</h1>
          <Link href={"/add_module"}>
            <FilePlus2 size={24} className="cursor-pointer" />
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
        {modules!.length > 0 && (
          <div className="overflow-x-auto bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
            <table className="table">
              <thead>
                <tr>
                  <th>Module ID</th>
                  <th>Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.id}>
                    <td>
                      <Link href={`/teacher_modules/${module.id}`}>
                        <h1 className="font-bold">{module.id}</h1>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/teacher_modules/${module.id}`}>
                        <h1 className="">{module.title}</h1>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/teacher_modules/${module.id}`}>
                        <p className="text-sm text-wrap text-ellipsis">
                          {module.description}
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
