import React from "react";
import { staffs } from "../../assets/data/db";
import StaffList from "./StaffList";

const StaffManagement = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Users Management</h2>
      <StaffList staffs={staffs} />
    </div>
  );
};

export default StaffManagement;
