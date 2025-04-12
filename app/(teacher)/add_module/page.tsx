"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";

import { useState } from "react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record!;

  const [files, setFiles] = useState<File[]>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [posting, setPosting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleDelete = (indexToDelete: number) => {
    setFiles((prevFiles) =>
      prevFiles!.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    setPosting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("visible", String(visibility));
    formData.append("teacher_id", user.id);

    if (files) {
      files.forEach((file) => {
        formData.append("contents", file);
      });
    }

    try {
      await pocketbase_instance.collection("modules").create(formData);
      router.push("teacher_modules");
    } catch (error) {
      console.error("Failed to post module", error);
      setErrorMessage(error.message || error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
      <HeaderNavbar />
      <h1 className="text-3xl font-black">Module details</h1>
      <div className="flex flex-col bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl gap-4">
        <div className="grid grid-cols-2 items-center">
          <label className="floating-label">
            <span>Module title</span>
            <input
              type="text"
              placeholder="Module title"
              className="input input-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold">Module visibility</h1>
            <div className="flex flex-row gap-4">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility}
                  onChange={() => setVisibility(true)}
                  className="radio radio-sm"
                />
                <p>Visible</p>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <input
                  type="radio"
                  name="visibility"
                  checked={!visibility}
                  onChange={() => setVisibility(false)}
                  className="radio radio-sm"
                />
                <p>Invisible</p>
              </div>
            </div>
          </div>
        </div>
        <textarea
          placeholder="Module description"
          className="textarea w-full resize-none text-wrap"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
      <button
        className="btn btn-soft btn-dash btn-success btn-md"
        disabled={posting}
        onClick={handleSubmit}
      >
        {posting ? "Posting...." : "Post module"}
      </button>
    </main>
  );
}
