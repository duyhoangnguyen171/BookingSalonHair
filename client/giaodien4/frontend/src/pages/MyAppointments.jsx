import React from "react";
import AppointmentList from "../components/AppointmentList";

const MyAppointments = () => {
  return (
    <div className="">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        <AppointmentList customerId="cus1" />
      </div>
    </div>
  );
};

export default MyAppointments;
