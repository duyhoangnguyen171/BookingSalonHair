import React from "react";
import { services } from "../../assets/data/db";
import ServiceList from "./ServiceList";

const ServiceManagement = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Service Management</h2>
      <div className="">
        <button className="mb-5 bg-green-500 p-2 rounded-2xl hover:bg-green-300 cursor-pointer">
          Thêm dịch vụ
        </button>
      </div>
      <div className="">
        <ServiceList services={services} />
      </div>
    </div>
  );
};

export default ServiceManagement;
