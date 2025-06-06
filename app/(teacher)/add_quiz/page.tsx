/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";

import { useState } from "react";
import { LoaderPinwheel, Plus, ShieldAlert, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const router = useRouter();
  const user = pocketbase_instance.authStore.record!;

  const [moduleID, setModuleID] = useState<string | null>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState();

  const [posting, setPosting] = useState(false);

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

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const updateQuestion = (index: number, field: keyof any, value: any) => {
    const updated: any[] = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_: any, i: number) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (visibility: boolean) => {
    if (!title || questions.length === 0) {
      alert("Please fill all fields and add at least one question.");
      return;
    }

    setPosting(true);
    try {
      await pocketbase_instance.collection("quiz").create({
        title: title,
        description: description,
        module: moduleID || null,
        visible: visibility,
        quiz: questions,
        teacher_id: user!.id,
      });

      router.push("/teacher_quiz");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to post quiz.");
    } finally {
      setPosting(false);
    }
  };

  if (modules) {
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <h1 className="text-3xl font-black">Quiz details</h1>
        <div className="flex flex-col bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl gap-4">
          <label className="floating-label">
            <span>Quiz title</span>
            <input
              type="text"
              placeholder="Module title"
              className="input input-lg w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <textarea
            placeholder="Module description"
            className="textarea w-full resize-none text-wrap"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Modules</legend>
            <select
              value={moduleID!}
              onChange={(e) => setModuleID(e.target.value)}
              className="select w-full"
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
        </div>

        <div className="flex flex-row items-center justify-between">
          <h1 className="text-3xl font-black">Questions</h1>
          <Plus size={24} onClick={addQuestion} />
        </div>

        {questions.map((q: any, qIndex: number) => (
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
              onChange={(e) =>
                updateQuestion(qIndex, "question", e.target.value)
              }
              placeholder="Enter question"
              className="input input-bordered w-full mb-4"
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
                    onChange={(e) =>
                      updateOption(qIndex, oIndex, e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    className="input input-sm input-bordered w-full"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        {questions.length >= 2 && (
          <div className="grid grid-cols-2 gap-4">
            <button
              className="btn btn-soft btn-dash btn-primary btn-md"
              disabled={posting}
              onClick={() => handleSubmit(false)}
            >
              {posting ? "Saving...." : "Save as draft"}
            </button>
            <button
              className="btn btn-soft btn-dash btn-success btn-md"
              disabled={posting}
              onClick={() => handleSubmit(true)}
            >
              {posting ? "Posting...." : "Post quiz"}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="flex flex-row gap-4 items-center bg-red-500 text-white p-4 rounded-3xl">
            <ShieldAlert size={24} />
            <p>{errorMessage}</p>
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
