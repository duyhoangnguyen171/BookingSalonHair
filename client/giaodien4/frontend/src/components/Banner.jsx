import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className="flex bg-gray-200 rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-10 md:my-10">
      {/* ------------- left Side Banner ------------- */}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-light">
          <p className="">Ưu Đãi Đặt Biệt : Giảm 20% cho tất cả dịch vụ</p>
        </div>
        <button
          onClick={() => {
            navigate("/services");
            scrollTo(0, 0);
          }}
          className="bg-black text-white text-sm sm:text-base font-semibold  px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all"
        >
          Đặt lịch ngay
        </button>
      </div>
      {/* ------------ --- right Side Banner --------------- */}
      <div className="hidden  md:block md:w-1/2 lg:w-[370px] relative">
        <img
          src={assets.appointment_img}
          alt=""
          className="w-full absolute bottom-0 right-0 max-w-md"
        />
      </div>
    </div>
  );
};

export default Banner;
