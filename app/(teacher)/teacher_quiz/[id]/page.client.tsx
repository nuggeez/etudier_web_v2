"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import HeaderNavbar from "../../components/HeaderNavbar";
import pocketbase_instance from "@/app/lib/pocketbase";
import { useRouter } from "next/navigation";

import { ArrowLeft, Plus, Trash, ShieldAlert } from "lucide-react";

export default function ClientComponent({ data }: { data: any }) {
  const router = useRouter();

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [questions, setQuestions] = useState<any[]>(data.quiz || []);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateQuestion = (index: number, field: keyof any, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const saveChanges = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await pocketbase_instance.collection("quiz").update(data.id, {
        title,
        description,
        quiz: questions,
      });
      router.push("/teacher_quiz");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <HeaderNavbar />
      <div className="flex items-center justify-between">
        <ArrowLeft
          size={24}
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <button
          onClick={saveChanges}
          disabled={saving}
          className="btn btn-soft btn-success btn-md"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered text-2xl font-bold w-full"
          placeholder="Quiz Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered resize-none w-full"
          placeholder="Quiz Description"
        />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Questions</h1>
        <Plus onClick={addQuestion} className="cursor-pointer" />
      </div>

      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="flex flex-col gap-2 bg-gray-50 border border-gray-300 p-4 rounded-xl shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Question {qIndex + 1}</h3>
            <Trash
              className="text-red-500 cursor-pointer"
              onClick={() => deleteQuestion(qIndex)}
            />
          </div>
          <input
            type="text"
            value={q.question}
            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
            placeholder="Enter question"
            className="input input-bordered w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt: any, oIndex: any) => (
              <label key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`answer-${qIndex}`}
                  checked={q.answer === oIndex}
                  onChange={() => updateQuestion(qIndex, "answer", oIndex)}
                  className="radio radio-sm"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${oIndex + 1}`}
                  className="input input-sm input-bordered w-full"
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      {errorMessage && (
        <div className="flex flex-row gap-4 items-center bg-red-500 text-white p-4 rounded-3xl">
          <ShieldAlert size={24} />
          <p>{errorMessage}</p>
        </div>
      )}
    </>
  );
}
