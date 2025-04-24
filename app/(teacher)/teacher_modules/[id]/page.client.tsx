/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import HeaderNavbar from "../../components/HeaderNavbar";
import pocketbase_instance from "@/app/lib/pocketbase";
import Link from "next/link";

import { ArrowLeft, Download, Edit, EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [course, setCourse] = useState(data.course);
  const [imagePreviewURL, setImagePreviewURL] = useState(
    files && files!.thumbnail_url ? files!.thumbnail_url : ""
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log(data);
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
        {user && user.id == data.teacher_id && (
          <Edit
            size={24}
            onClick={() => {
              const modal = document.getElementById("edit-modal");

              if (modal instanceof HTMLDialogElement) {
                modal.showModal();
              } else {
                console.warn("Element is not a <dialog>, can't call .close()");
              }
            }}
            className="cursor-pointer"
          />
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

      {files && files?.files == undefined && (
        <div className="bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl items-center justify-center">
          <h1 className="text-3xl font-black">No resources found.</h1>
        </div>
      )}

      {files && files?.files.length > 0 && (
        <>
          <h1 className="text-3xl font-black">Resources</h1>
          <div className="bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
            {files.files.map((file: any, index: any) => (
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
      )}

      {data.expand.quiz && (
        <>
          <h1 className="text-3xl font-black">Quiz</h1>
          <div className="bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
            <Link
              href={`/teacher_quiz/${data.expand.quiz.id}`}
              key={data.expand.quiz.id}
              className="flex gap-6 items-center text-sm text-gray-700 bg-gray-100 rounded-3xl p-6"
            >
              <EyeIcon size={24} />
              <span>{data.expand.quiz.title}</span>
            </Link>
          </div>
        </>
      )}

      <dialog id="edit-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4">Edit Module</h3>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              setIsSaving(true);

              try {
                await pocketbase_instance
                  .collection("modules")
                  .update(data.id, formData);
                const modal = document.getElementById("edit-modal");

                if (modal instanceof HTMLDialogElement) {
                  modal.showModal();
                }

                router.refresh();
                window.location.reload();
              } catch (err: any) {
                alert("Failed to update module: " + err.message);
              }
            }}
          >
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Title</span>
              <input
                name="title"
                type="text"
                className="input w-full"
                defaultValue={title}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-semibold">Course</span>
              <input
                name="course"
                type="text"
                className="input w-full"
                defaultValue={course}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-semibold">Description</span>
              <textarea
                name="description"
                className="textarea w-full resize-none"
                defaultValue={description}
              />
            </label>

            <label className="flex flex-col gap-1 w-full">
              <span className="font-semibold">
                Resources (Upload new files)
              </span>
              <input
                type="file"
                name="contents"
                multiple
                className="file-input w-full"
              />
            </label>

            <label className="flex flex-col gap-1 w-full">
              <span className="font-semibold">Thumbnail</span>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                className="file-input w-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImagePreviewURL(URL.createObjectURL(file));
                }}
              />
            </label>

            {imagePreviewURL && (
              <img
                src={imagePreviewURL}
                className="w-full aspect-square object-cover rounded-xl bg-gray-100"
              />
            )}

            <div className="modal-action flex justify-end gap-2">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const modal = document.getElementById("edit-modal");

                  if (modal instanceof HTMLDialogElement) {
                    modal.close();
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSaving}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
