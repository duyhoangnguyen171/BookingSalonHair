import React from "react";

const AppointmentList = ({ appointments }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Customer List</h2>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Customer</th>
            <th className="border border-gray-300 px-4 py-2">Service</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Time</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="border border-gray-300 px-4 py-2">
                {appointment.customerName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {appointment.serviceName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {appointment.date}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {appointment.time}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {appointment.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;
