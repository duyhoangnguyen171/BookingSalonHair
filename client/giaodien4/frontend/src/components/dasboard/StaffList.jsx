import React from "react";

const StaffList = ({ staffs }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Users List</h2>

      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              image
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Email
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Phone
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Gender
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Join Date
            </th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff) => (
            <tr key={staff.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{staff.name}</td>
              <td className="border border-gray-300 px-4 py-2 ">
                <img
                  src={staff.image}
                  alt={staff.name}
                  className="w-20 h-20 rounded-full"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {staff.email}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {staff.phone}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {staff.gender}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {staff.joinDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffList;
