/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import HeaderNavbar from "../../components/HeaderNavbar";
import pocketbase_instance from "@/app/lib/pocketbase";
import Link from "next/link";

import { ArrowLeft, Download, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function ClientComponent({ data }: { data: any }) {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record;

  const { data: files } = useQuery({
    queryKey: [data.id],
    queryFn: async () => {
      const temp = [];
      for (const file of data.contents) {
        const url = pocketbase_instance.files.getURL(data, file);
        temp.push({ url: url, title: url.split("/").pop() });
      }


      return {
        thumbnail_url: pocketbase_instance.files.getURL(data, data.thumbnail),
        files: temp,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

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
      </div>
      <div className="grid grid-cols-2 gap-8">
        {files && (
          <img
            src={
              files.thumbnail_url ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg_ITtT5GMZ-5j9ybW17fpwAOm3Lg0hdzNcw&s"
            }
            className="w-full aspect-square rounded-3xl object-cover shadow-md"
          />
        )}

        <div className="flex flex-col">
          <h1 className="font-bold text-3xl">{data.title}</h1>
          {data.description && (
            <p className="text-sm text-gray-500">{data.description}</p>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-black">Resources</h1>
      <div className="bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
        {files &&
          files?.files.length > 0 &&
          files.files.map((file: any, index: any) => (
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
