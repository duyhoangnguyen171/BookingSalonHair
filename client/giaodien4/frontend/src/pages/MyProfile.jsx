import React, { useState } from "react";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const [userData, setUserDate] = useState({
    name: "Dao Van Phuong",
    image: assets.profile_pic,
    email: "phuongdao@gmail.com",
    phone: "+84 809 838 838",
    address: "57th Cross, Richomm ,Bangalore, Karnataka",

    gender: "Male",
    dob: "2000-10-20",
  });
  const [isEdit, setIsEdit] = useState(true);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <img className="w-36 rounded" src={userData.image} alt="" />
      {isEdit ? (
        <input
          type="text"
          className="bg-gray-100 text-3xl max-w-100 mt-4 rounded font-medium "
          value={userData.name}
          onChange={(e) =>
            setUserDate((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className=" font-medium text-3xl mt-4 text-neutral-800">
          {userData.name}
        </p>
      )}
      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div className=" mt-5">
        <p className="text-neutral-500 underline ">CONTACT INFORMATION</p>
        <div className="mt-2">
          <div className="flex">
            <p className="font-medium mr-4">Email:</p>
            <p className="text-blue-500"> {userData.email}</p>
          </div>
          <div className="flex">
            <p className="font-medium mr-4">Phone:</p>
            <div className="">
              {isEdit ? (
                <input
                  type="text"
                  className="border border-zinc-200"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserDate((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              ) : (
                <p className=" text-teal-400 ">{userData.phone}</p>
              )}
            </div>
          </div>
          <div className="flex">
            <p className="font-medium mr-4">Address:</p>
            {isEdit ? (
              <p className="">
                <input
                  type="text"
                  className=" px-4 border border-zinc-200  "
                  value={userData.address}
                  onChange={(e) =>
                    setUserDate((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </p>
            ) : (
              <p className="text-gray-500">{userData.address}</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-neutral-500 underline">BASIC INFORMATION</p>
        <div className="flex mt-2">
          <p className="font-medium">Gender :</p>
          {isEdit ? (
            <select
              value={userData.gender}
              onChange={(e) =>
                setUserDate((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option className="max-w-20" value="Male">
                Male
              </option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="mx-2 text-gray-500">{userData.gender}</p>
          )}
        </div>
        <div className="flex">
          <p className="font-medium">Birthday :</p>
          {isEdit ? (
            <p className="">
              <input
                type="date"
                className=" px-4 border border-zinc-200 w-full "
                value={userData.dob}
                onChange={(e) =>
                  setUserDate((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            </p>
          ) : (
            <p className="mx-2 text-gray-500">{userData.dob}</p>
          )}
        </div>
      </div>
      <div className=" my-8">
        {isEdit ? (
          <button
            onClick={() => setIsEdit(false)}
            className="bg-blue-400 px-4 py-2 rounded-2xl hover:bg-blue-600 text-white duration-300 cursor-pointer"
          >
            Save information
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="bg-blue-400 px-4 py-2 rounded-2xl hover:bg-blue-600 text-white duration-300 cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
