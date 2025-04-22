/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";

import { CircleUserRound, Edit, LoaderPinwheel } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;
  const [isInitialized, setIsInitialized] = useState(false);

  const [name, setName] = useState(user ? user.name : "");
  const [school, setSchool] = useState(user ? user!.school : "");
  const [department, setDepartment] = useState(user ? user!.department : "");
  const [yearLevel, setYearLevel] = useState(user ? user!.year_level : "");

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
    const checkData = async () => {
      console.log(user);
      setIsInitialized(true);
    };

    checkData();
  }, []);

  if (isInitialized)
    return (
      <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
        <HeaderNavbar />
        <div className="relative flex flex-row items-center justify-center gap-6 bg-gray-50 border border-gray-300 shadow-md p-8 rounded-3xl">
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
          <CircleUserRound size={80} />
          <div className="flex flex-col">
            <h1 className="text-3xl">{user!.name}</h1>
            {user!.school && (
              <p className="text-lg text-gray-500">Teacher at {user!.school}</p>
            )}
            {!user!.school && (
              <p className="text-lg text-gray-500">{user!.account_type}</p>
            )}
            <p className="text-lg text-gray-500">+63-{user!.phone_number}</p>
            <p className="text-lg text-gray-500">{user!.qualifications}</p>
            <p className="text-lg text-gray-500">{user!.subject_expertise}</p>
            <p className="text-lg text-gray-500">ID: {user!.id}</p>
          </div>
        </div>
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
