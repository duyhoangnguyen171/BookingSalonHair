import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Services = () => {
  const navigate = useNavigate();

  const { services, currencySymbol } = useContext(AppContext);

  return (
    <div className="">
      <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
        <h1 className="text-3xl font-medium">Tất Cả Dịch Vụ</h1>

        <div className="w-full grid grid-cols-1  sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4 pt-5 gap-y-6 px-3 sm:px-0">
          {services.map((item, index) => (
            <div
              key={index}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-300"
            >
              <img
                src={item.image}
                alt={item.name}
                className="bg-blue-50 w-full h-2/3"
              />
              <div className="p-4">
                <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                <div className="text-gray-600 text-sm">
                  <p>
                    Giá từ:{" "}
                    <span className="text-red-500 mx-1">{item.price}</span>
                    {currencySymbol}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate(`/appointment/${item._id}`);
                    scrollTo(0, 0);
                  }}
                  className="text-amber-700 my-2 font-bold text-lg bg-amber-300 py-2 px-4 rounded-2xl hover:bg-amber-200"
                >
                  Đặt lịch ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
