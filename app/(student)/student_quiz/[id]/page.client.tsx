"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import HeaderNavbar from "../../components/HeaderNavbar";
import pocketbase_instance from "@/app/lib/pocketbase";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function ClientComponent({ data }: { data: any }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(
    Array(data.quiz.length).fill(-1)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...answers];
    updated[questionIndex] = optionIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await pocketbase_instance
        .collection("quiz_submissions")
        .create({
          quiz_id: data.id,
          answers: answers,
          student_id: pocketbase_instance.authStore.record!.id,
        });

      setSubmitted(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Submission failed");
    } finally {
      setSubmitting(false);
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
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <p className="text-gray-600">{data.description}</p>
      </div>

      <h2 className="text-xl font-bold mb-2">Questions</h2>
      {data.quiz.map((q: any, qIndex: number) => (
        <div
          key={qIndex}
          className="flex flex-col gap-2 bg-gray-50 border border-gray-300 p-4 rounded-xl shadow"
        >
          <h3 className="font-bold">Question {qIndex + 1}</h3>
          <p>{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt: string, oIndex: number) => (
              <button
                key={oIndex}
                onClick={() => handleSelect(qIndex, oIndex)}
                className={`px-6 py-2 rounded-3xl text-left ${
                  answers[qIndex] === oIndex
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 border border-gray-300 shadow-sm"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {errorMessage && (
        <div className="flex flex-row gap-4 items-center bg-red-500 text-white p-4 rounded-3xl mt-4">
          <ShieldAlert size={24} />
          <p>{errorMessage}</p>
        </div>
      )}

      {!submitted ? (
        <button
          className="btn btn-soft btn-success btn-md mt-6"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit Answers"}
        </button>
      ) : (
        <p className="text-green-600 font-bold mt-6">
          Quiz submitted successfully!
        </p>
      )}
    </>
  );
}
