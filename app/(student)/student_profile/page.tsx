/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import dayjs from "dayjs";

import { CircleUserRound, Edit, LoaderPinwheel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;

  const [name, setName] = useState(user ? user!.name : "");
  const [school, setSchool] = useState(user ? user!.school : "");
  const [department, setDepartment] = useState(user ? user!.department : "");
  const [yearLevel, setYearLevel] = useState(user ? user!.year_level : "");
  const [course, setCourse] = useState(user ? user!.course : "");
  const [gender, setGender] = useState(user ? user!.gender : "");

  const { data } = useQuery({
    queryKey: ["student_profile", user ? user!.id : "user_id"],
    queryFn: async () => {
      try {
        const modules_progress = await pocketbase_instance
          .collection("users_modules_progress")
          .getList(1, 5, {
            filter: `user_id = '${user!.id}'`,
            expand: "module_id",
          });

        const quiz_progress = await pocketbase_instance
          .collection("users_quiz_submissions")
          .getList(1, 5, {
            filter: `user_id = '${user!.id}'`,
            expand: "quiz_id",
          });

        console.log({
          modules_progress: modules_progress.items,
          quiz_progress: quiz_progress.items,
        });

        return {
          modules_progress: modules_progress.items,
          quiz_progress: quiz_progress.items,
        };
      } catch (err) {}
    },
    refetchOnWindowFocus: false,
  });

  const handleUpdateProfile = async () => {
    try {
      await pocketbase_instance.collection("users").update(user!.id, {
        name: name,
        school: school,
        department: department,
        year_level: yearLevel,
      });

      const modal = document.getElementById("edit-profile-modal");

      if (modal instanceof HTMLDialogElement) {
        modal.close();
      } else {
        console.warn("Element is not a <dialog>, can't call .close()");
      }
    } catch (err: any) {}
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  if (data && user)
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <h1 className="font-bold text-3xl text-gray-600">Profile details</h1>
        <div className="relative flex flex-row items-center justify-center gap-12 bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
          <Edit
            size={24}
            className="absolute right-8 top-4 shrink-0 cursor-pointer"
            onClick={() => {
              const modal = document.getElementById("edit-profile-modal");

              if (modal instanceof HTMLDialogElement) {
                modal.showModal();
              } else {
                console.warn("Element is not a <dialog>, can't call .close()");
              }
            }}
          />
          <div className="flex flex-col gap-4 items-center">
            <CircleUserRound size={80} />
          </div>
          <div className="flex flex-col">
            <p className="text-lg text-gray-500">Student at {user!.school}</p>
            <p className="text-lg text-gray-500">
              ID: <b>{user!.id}</b>
            </p>
            <p className="text-lg text-gray-500">
              Full Name: <b>{user!.name}</b>
            </p>
            <p className="text-lg text-gray-500">
              Phone number: <b>+63-{user!.phone_number}</b>
            </p>
            <p className="text-lg text-gray-500">
              Email: <b>{user!.email}</b>
            </p>
            <p className="text-lg text-gray-500">
              Date of birth:{" "}
              <b>
                {dayjs(user!.date_of_birth).format("MMMM DD, YYYY").toString()}
              </b>
            </p>
          </div>
        </div>
        <div className="relative flex flex-col gap-1 bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
          <p className="text-lg text-gray-500">
            Department: <b>{user!.department}</b>
          </p>
        </div>
        {data && (
          <>
            <h1 className="text-4xl font-bold">Recent activities</h1>
            <div className="overflow-x-auto bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {/* row 1 */}
                  {data.modules_progress &&
                    data.modules_progress.map((item) => (
                      <tr key={item.id}>
                        <td>{item!.expand!.module_id.title}</td>
                        <td>{item!.expand!.module_id.description}</td>
                        <td>Module</td>
                      </tr>
                    ))}
                  {data.quiz_progress &&
                    data.quiz_progress.map((item) => (
                      <tr key={item.id}>
                        <td>{item!.expand!.quiz_id.title}</td>
                        <td>{item!.expand!.quiz_id.description}</td>
                        <td>Quiz</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <dialog id="edit-profile-modal" className="modal">
          <div className="modal-box flex flex-col gap-4">
            <h3 className="font-bold text-lg">Edit profile</h3>
            <div className="flex flex-col gap-4">
              <label className="input w-full">
                <span className="label">Name</span>
                <input
                  type="text"
                  className="w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="input w-full">
                <span className="label">School</span>
                <input
                  type="text"
                  className="w-full"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
              </label>
              <label className="input w-full">
                <span className="label">Department</span>
                <input
                  type="text"
                  className="w-full"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </label>
              <label className="input w-full">
                <span className="label">Year Level</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  className="w-full"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn" onClick={handleUpdateProfile}>
                  Save
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </main>
    );

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4 items-center justify-center">
      <LoaderPinwheel className="animate-spin" size={64} />
    </main>
  );
}
