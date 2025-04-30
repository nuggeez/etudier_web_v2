/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import pocketbase_instance from "@/app/lib/pocketbase";
import HeaderNavbar from "../components/HeaderNavbar";
import dayjs from "dayjs";

import { CircleUserRound, Edit, LoaderPinwheel } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const user = pocketbase_instance.authStore.record!;
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  const [name, setName] = useState(user ? user.name : "");
  const [school, setSchool] = useState(user ? user!.school : "");
  const [subject_expertise, setSubjectExpertise] = useState(
    user ? user!.subject_expertise : ""
  );
  const [qualifications, setQualifications] = useState(
    user ? user!.year_level : ""
  );
  const [department, setDepartment] = useState(user ? user!.department : "");

  const handleUpdateProfile = async () => {
    try {
      await pocketbase_instance.collection("users").update(user!.id, {
        name: name,
        school: school,
        subject_expertise: subject_expertise,
        qualifications: qualifications,
        department: department,
      });
      await pocketbase_instance.collection("users").authRefresh();
      router.refresh();

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
            <p className="text-lg text-gray-500">ID: {user!.id}</p>
          </div>
          <div className="flex flex-col">
            {user!.school && (
              <p className="text-lg text-gray-500">Teacher at {user!.school}</p>
            )}
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
          {user!.school && (
            <p className="text-lg text-gray-500">Teacher at {user!.school}</p>
          )}
          <p className="text-lg text-gray-500">
            Department: <b>{user!.department}</b>
          </p>
          <p className="text-lg text-gray-500">
            Subject Expertise: <b>{user!.subject_expertise}</b>
          </p>
          <p className="text-lg text-gray-500">
            Qualifications: <b>{user!.qualifications}</b>
          </p>
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
                <span className="label">Subject Expertise</span>
                <input
                  type="text"
                  className="w-full"
                  value={subject_expertise}
                  onChange={(e) => setSubjectExpertise(e.target.value)}
                />
              </label>
              <label className="input w-full">
                <span className="label">Qualifications</span>
                <input
                  type="text"
                  className="w-full"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
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
