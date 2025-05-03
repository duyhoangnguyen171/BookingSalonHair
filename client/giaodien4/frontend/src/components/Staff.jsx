import React from "react";

const Staff = ({ staffs }) => {
  return (
    <section className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h2 className="mt-16 text-2xl font-bold text-center">
        Nhân viên Của chúng tôi
      </h2>
      <div className="w-full grid grid-cols-1  sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {staffs
          .map((staff, index) => (
            <div
              key={index}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-300"
            >
              <div className="bg-white rounded-lg  p-8">
                <img
                  src={staff.image}
                  alt=""
                  className="h-20 mx-auto rounded-full"
                />

                <h4 className="text-xl font-bold mt-4">{staff.name}</h4>
                <p className="mt-1">{staff.position}</p>
              </div>
            </div>
          ))

          .slice(0, 5)}
      </div>
    </section>
  );
};

export default Staff;
