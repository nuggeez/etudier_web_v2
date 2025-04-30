/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import HeaderNavbar from "../../components/HeaderNavbar";
import pocketbase_instance from "@/app/lib/pocketbase";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash,
  ShieldAlert,
  NotebookIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ClientComponent({ data }: { data: any }) {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record!;

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [questions, setQuestions] = useState<any[]>(data.quiz || []);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moduleID, setModuleID] = useState<string | null>("");

  const { data: modules }: { data: any } = useQuery({
    queryKey: ["teacher_add_quiz"],
    queryFn: async () => {
      try {
        const { items } = await pocketbase_instance
          .collection("modules")
          .getList(1, 50, { filter: `teacher_id="${user.id}"` });

        return items;
      } catch (err) {
        console.error(err);
        return err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: quiz, error: noQuiz }: { data: any; error: any } = useQuery({
    queryKey: ["module_quiz", data.id],
    queryFn: async () => {
      try {
        const quiz = await pocketbase_instance!
          .collection("quiz")
          .getFullList({ filter: `module = '${data.id}'` });

        console.log(quiz);

        return quiz;
      } catch (err) {
        return err;
      }
    },
  });

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

  const deleteQuiz = async () => {
    try {
      const allSubmissions = await pocketbase_instance
        .collection("users_quiz_submissions")
        .getFullList({ filter: `quiz_id = '${data.id}'` });

      allSubmissions.forEach(async (record) => {
        await pocketbase_instance
          .collection("users_quiz_submissions")
          .delete(record.id);
      });

      await pocketbase_instance.collection("quiz").update(data.id, {
        module: null,
      });
      await pocketbase_instance.collection("quiz").delete(data.id);
      router.back();
    } catch (err) {
      alert(`Error deleting quiz: ${err}`);
    }
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
      window.location.reload();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const [index, setIndex] = useState(0);
  const pages = [
    <>
      <HeaderNavbar />
      <div className="flex items-center justify-between">
        <ArrowLeft
          size={24}
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <div className="flex flex-row gap-4 items-center">
          <button
            onClick={() => setIndex(1)}
            className="btn btn-soft btn-primary btn-md"
          >
            Edit quiz
          </button>
          <button
            onClick={deleteQuiz}
            className="btn btn-soft btn-warning btn-md"
          >
            Delete
          </button>
        </div>
      </div>
      <div>
        <h1 className="font-bold text-3xl">{data.title}</h1>
        <h1 className="text-gray-400">{data.description}</h1>
      </div>
      <h1 className="font-bold text-3xl">Questions</h1>
      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="flex flex-col gap-2 bg-gray-50 border border-gray-300 p-4 rounded-xl shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Question {qIndex + 1}</h3>
          </div>
          <input
            type="text"
            value={q.question}
            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
            placeholder="Enter question"
            className="input w-full"
            disabled
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
                  disabled
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${oIndex + 1}`}
                  className="input input-sm w-full"
                  disabled
                />
              </label>
            ))}
          </div>
        </div>
      ))}
    </>,
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
          className="input text-2xl font-bold w-full"
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
      {modules && (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Modules</legend>
          <select
            value={moduleID!}
            onChange={(e) => setModuleID(e.target.value)}
            className="select w-full"
            name="module"
          >
            <option disabled={true}>
              Related to your modules? Select your module
            </option>
            <option value="">None</option>
            {modules.map((module: any) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
          <span className="fieldset-label">
            If this quiz is for your module or is atleast related, you can
            select the module.
          </span>
        </fieldset>
      )}
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
            className="input w-full"
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
                  className="input input-sm w-full"
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
    </>,
  ];

  return <>{pages[index]}</>;
}
