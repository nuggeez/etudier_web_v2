/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import HeaderNavbar from "../../components/HeaderNavbar";
import pocketbase_instance from "@/app/lib/pocketbase";
import Link from "next/link";

import { ArrowLeft, Bookmark, CheckCircle, Download, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientComponent({ data }: { data: any }) {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record;

  const [files, setFiles] = useState<any[]>();
  const [percent, setPercent] = useState("0%");
  const [bookmarked, setBookmark] = useState(false);

  useEffect(() => {
    const getFilesUrl = async () => {
      const temp = [];
      for (const file of data.contents) {
        const url = pocketbase_instance.files.getURL(data, file);
        temp.push({ url: url, title: url.split("/").pop() });
      }

      setFiles(temp);
    };
    const checkProgress = async () => {
      try {
        const record = await pocketbase_instance
          .collection("users_modules_progress")
          .getFirstListItem(
            `user_id = '${user!.id}' && module_id = '${data.id}'`
          );

        setPercent(record.percent);
        setBookmark(record.bookmarked);
      } catch (err: any) {
        console.log(err);
        console.log("No progress");
      }
    };

    getFilesUrl();
    checkProgress();
  }, [data]);

  return (
    <>
      <HeaderNavbar />
      <div className="flex flex-row items-center justify-between">
        <ArrowLeft
          size={24}
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        {user!.id == data.teacher_id && (
          <Edit size={24} onClick={() => {}} className="cursor-pointer" />
        )}
        {user!.account_type == "Student" && (
          <div className="flex flex-row items-center gap-4">
            <Bookmark size={24} onClick={() => {}} className="cursor-pointer" />
            <CheckCircle
              size={24}
              onClick={() => {}}
              className="cursor-pointer"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold text-3xl">{data.title}</h1>
        {data.description && <p className="text-sm">{data.description}</p>}
      </div>
      <h1 className="text-3xl font-black">Resources</h1>
      <div className="bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
        {files &&
          files?.length > 0 &&
          files.map((file: { title: string; url: string }, index) => (
            <Link
              href={file.url}
              key={index}
              className="flex gap-6 items-center text-sm text-gray-700 bg-gray-100 rounded-3xl p-6"
            >
              <Download size={24} />
              <span>{file.title}</span>
            </Link>
          ))}
      </div>
    </>
  );
}
