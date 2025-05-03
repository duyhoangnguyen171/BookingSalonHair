import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div className="">
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          CONTACT{" "}
          <span
            className="text-gray-700 font-semibold
          "
          >
            US
          </span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center my-10 gap-10 mb-28 text-sm">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.contact_image}
          alt=""
        />
        <div className="flex flex-col justify-center items-start gap-6 ">
          <p className="font-semibold text-lg text-gray-700">OUR OFFICE</p>
          <p className="text-gray-600">
            00000 Willms Station <br />
            Suite 000, Washington, USA
          </p>
          <p className="text-gray-600">
            Tel: (000) 000-0000 <br />
            Email: greatstackdev@gmail.com
          </p>
          <p className="font-semibold text-lg text-gray-700">
            CAREERS AT PRESCRIPTO
          </p>
          <p className="text-gray-600">
            Learn more about our teams and job openings.
          </p>
          <button className="border px-8 py-4 text-sm hover:bg-black hover:text-white rounded-2xl duration-300 cursor-pointer">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
