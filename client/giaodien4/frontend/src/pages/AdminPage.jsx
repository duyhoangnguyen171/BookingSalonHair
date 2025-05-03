import React, { useState } from "react";
import StaffManagement from "../components/dasboard/StaffManagement ";
import ServiceManagement from "../components/dasboard/ServiceManagement ";
import AppointmentManagement from "../components/dasboard/AppointmentManagement ";
import Dasboard from "../components/dasboard/Dasboard";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dasboard");
  return (
    <div className="mt-20">
      <div className="min-h-screen bg-gray-100">
        {/* Tabs */}
        <div className="container mx-auto px-6 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("dasboard")}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
                activeTab === "dasboard"
                  ? "bg-amber-400 hover:bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Dasboard
            </button>
            <button
              onClick={() => setActiveTab("staffs")}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
                activeTab === "staffs"
                  ? "bg-amber-400 text-white hover:bg-amber-500"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Staffs
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
                activeTab === "services"
                  ? "bg-amber-400 hover:bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-amber-400 hover:bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Appointments
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-4">
          {activeTab === "staffs" && <StaffManagement />}
          {activeTab === "services" && <ServiceManagement />}
          {activeTab === "appointments" && <AppointmentManagement />}
          {activeTab === "dasboard" && <Dasboard />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
