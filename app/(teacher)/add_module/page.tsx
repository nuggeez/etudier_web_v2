/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";

import { useState } from "react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record!;

  const [files, setFiles] = useState<File[]>();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [posting, setPosting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Thumbnail must be less than 2MB");
      return;
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleDelete = (indexToDelete: number) => {
    setFiles((prevFiles) =>
      prevFiles!.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleSubmit = async (visibility: boolean) => {
    if (!title || !description || !course) {
      alert("Please fill in all required fields.");
      return;
    }

    setPosting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("course", course);
    formData.append("visible", String(visibility));
    formData.append("teacher_id", user.id);

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    if (files) {
      files.forEach((file) => {
        formData.append("contents", file);
      });
    }

    try {
      await pocketbase_instance.collection("modules").create(formData);
      router.push("teacher_modules");
    } catch (error: any) {
      console.error("Failed to post module", error);
      setErrorMessage(error.message || error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
      <HeaderNavbar />
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/teacher_modules"}>Modules</Link>
          </li>
          <li>Add module</li>
        </ul>
      </div>
      <h1 className="text-3xl font-bold">Module details</h1>
      <div className="flex flex-col bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl gap-4">
        <label className="floating-label">
          <span>Module title</span>
          <input
            type="text"
            placeholder="Module title"
            className="input input-lg w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="floating-label">
          <span>Course</span>
          <input
            type="text"
            placeholder="Course"
            className="input input-lg w-full"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </label>
        <textarea
          placeholder="Module description"
          className="textarea w-full resize-none text-wrap"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Pick a file for cover image/thumbnail
          </legend>
          <input
            type="file"
            accept="image/*"
            className="file-input w-full"
            onChange={handleThumbnailChange}
          />
          <label className="fieldset-label">Max size 2MB</label>
        </fieldset>
        <div className="flex flex-col">
          {thumbnailPreview && (
            <>
              <h1 className="text-3xl font-bold">Thumbnail Preview</h1>
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-full max-h-240 aspect-square object-cover rounded-xl mt-4 border-0 shadow-md"
              />
            </>
          )}
        </div>
      </div>
      <h1 className="text-3xl font-black">Resources/files</h1>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 shadow"
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf, image/*"
          />
        </label>
      </div>
      {files && files.length > 0 && (
        <div className="flex flex-col bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl gap-4">
          <h2 className="text-lg font-bold">Selected Files</h2>
          <ul className="flex flex-col gap-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm text-gray-700 bg-gray-100 rounded-3xl p-6"
              >
                <span>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <Trash
                  onClick={() => handleDelete(index)}
                  className="cursor-pointer"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <button
          className="btn btn-soft btn-dash btn-primary btn-md"
          disabled={posting}
          onClick={() => handleSubmit(false)}
        >
          {posting ? "Saving..." : "Save as draft"}
        </button>
        <button
          className="btn btn-soft btn-dash btn-success btn-md"
          disabled={posting}
          onClick={() => handleSubmit(true)}
        >
          {posting ? "Posting...." : "Post module"}
        </button>
      </div>
    </main>
  );
}
