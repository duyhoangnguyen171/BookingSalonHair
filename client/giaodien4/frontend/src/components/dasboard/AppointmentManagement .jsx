import { appointments, customers, services } from "../../assets/data/db";

import React, { useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";

const AppointmentManagement = () => {
  const appointmentsWithDetails = appointments.map((appointment) => {
    const customer = customers.find((c) => c.id === appointment.customerId);
    const service = services.find((s) => s.id === appointment.serviceId);

    return {
      ...appointment,
      customerName: customer.name,
      customerPhone: customer.phone,
      serviceName: service.name,
      servicePrice: service.price,
    };
  });
  // Dummy data for appointments
  const [appoint, setAppoint] = useState(appointmentsWithDetails);

  // Function to handle deleting an appointment
  const handleDelete = (id) => {
    const updatedAppointments = appoint.filter(
      (appointment) => appointment.id !== id
    );
    setAppoint(updatedAppointments);
  };
  //   const handleStatusChange = (id, newStatus) => {
  //     setAppointments((prev) =>
  //       prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
  //     );
  //   };

  return (
    <section className=" sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Appointments Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {appoint.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {appointment.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {appointment.customerPhone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {appointment.serviceName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {appointment.status}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FiTrash2 className="inline w-5 h-5" />
                    </button>
                    <button className="ml-4 text-yellow-500 hover:text-yellow-700 transition">
                      <FiEdit className="inline w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Appointments Message */}
        {appointments.length === 0 && (
          <p className="text-center text-gray-600 mt-6">
            You have no appointments scheduled.
          </p>
        )}
      </div>
    </section>
  );
};

export default AppointmentManagement;

// import React, { useState, useMemo } from "react";
// import {
//   Search,
//   Trash2,
//   Edit2,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/ui/select";

// const AppointmentTracking = () => {
//   // States
//   const [appointments, setAppointments] = useState([
//     {
//       id: 1,
//       name: "John Doe",
//       phone: "0123456789",
//       services: ["Haircut", "Shaving"],
//       date: "2025-03-30",
//       time: "10:00",
//       status: "upcoming",
//     },
//     {
//       id: 2,
//       name: "Jane Smith",
//       phone: "0987654321",
//       services: ["Hair Coloring"],
//       date: "2025-03-31",
//       time: "14:00",
//       status: "completed",
//     },
//     // Add more sample data as needed
//   ]);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // Filter and Search Logic
//   const filteredAppointments = useMemo(() => {
//     return appointments.filter((appointment) => {
//       const matchesSearch =
//         appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         appointment.phone.includes(searchTerm);

//       const matchesStatus =
//         statusFilter === "all" || appointment.status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });
//   }, [appointments, searchTerm, statusFilter]);

//   // Pagination Logic
//   const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
//   const paginatedAppointments = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredAppointments.slice(start, start + itemsPerPage);
//   }, [filteredAppointments, currentPage]);

//   // Handlers
//   const handleDelete = (id) => {
//     setAppointments((prev) => prev.filter((app) => app.id !== id));
//   };

//   const handleStatusChange = (id, newStatus) => {
//     setAppointments((prev) =>
//       prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
//     );
//   };

//   return (
//     <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
//       <div className="container mx-auto max-w-5xl">
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//           {/* Header */}
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-2xl font-bold text-gray-800">
//               Appointment Management
//             </h2>
//             <p className="text-gray-600 mt-1">
//               Track and manage your scheduled appointments
//             </p>
//           </div>

//           {/* Search and Filter Bar */}
//           <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 items-center">
//             <div className="flex-1 min-w-[200px]">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by name or phone..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                 />
//               </div>
//             </div>

//             <div className="w-[200px]">
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="upcoming">Upcoming</SelectItem>
//                   <SelectItem value="completed">Completed</SelectItem>
//                   <SelectItem value="cancelled">Cancelled</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Appointments Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Client Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Services
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Schedule
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {paginatedAppointments.map((appointment) => (
//                   <tr key={appointment.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {appointment.name}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {appointment.phone}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex flex-wrap gap-1">
//                         {appointment.services.map((service, idx) => (
//                           <span
//                             key={idx}
//                             className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                           >
//                             {service}
//                           </span>
//                         ))}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center text-sm text-gray-900">
//                         <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                         {appointment.date}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {appointment.time}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <Select
//                         value={appointment.status}
//                         onValueChange={(value) =>
//                           handleStatusChange(appointment.id, value)
//                         }
//                       >
//                         <SelectTrigger
//                           className={`w-32 ${
//                             appointment.status === "upcoming"
//                               ? "bg-blue-50 text-blue-700"
//                               : appointment.status === "completed"
//                               ? "bg-green-50 text-green-700"
//                               : "bg-red-50 text-red-700"
//                           }`}
//                         >
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="upcoming">Upcoming</SelectItem>
//                           <SelectItem value="completed">Completed</SelectItem>
//                           <SelectItem value="cancelled">Cancelled</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button
//                         className="text-blue-600 hover:text-blue-900 mr-4"
//                         title="Edit appointment"
//                       >
//                         <Edit2 className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(appointment.id)}
//                         className="text-red-600 hover:text-red-900"
//                         title="Delete appointment"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
//               <div className="flex-1 flex justify-between sm:hidden">
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(prev - 1, 1))
//                   }
//                   disabled={currentPage === 1}
//                   className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//               <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                 <div>
//                   <p className="text-sm text-gray-700">
//                     Showing{" "}
//                     <span className="font-medium">
//                       {(currentPage - 1) * itemsPerPage + 1}
//                     </span>{" "}
//                     to{" "}
//                     <span className="font-medium">
//                       {Math.min(
//                         currentPage * itemsPerPage,
//                         filteredAppointments.length
//                       )}
//                     </span>{" "}
//                     of{" "}
//                     <span className="font-medium">
//                       {filteredAppointments.length}
//                     </span>{" "}
//                     results
//                   </p>
//                 </div>
//                 <div>
//                   <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
//                     <button
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.max(prev - 1, 1))
//                       }
//                       disabled={currentPage === 1}
//                       className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                     >
//                       <ChevronLeft className="w-5 h-5" />
//                     </button>
//                     {[...Array(totalPages)].map((_, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => setCurrentPage(idx + 1)}
//                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                           currentPage === idx + 1
//                             ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
//                             : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
//                         }`}
//                       >
//                         {idx + 1}
//                       </button>
//                     ))}
//                     <button
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                       }
//                       disabled={currentPage === totalPages}
//                       className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                     >
//                       <ChevronRight className="w-5 h-5" />
//                     </button>
//                   </nav>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Empty State */}
//           {filteredAppointments.length === 0 && (
//             <div className="text-center py-12">
//               <Calendar className="mx-auto h-12 w-12 text-gray-400" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">
//                 No appointments found
//               </h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 {searchTerm || statusFilter !== "all"
//                   ? "Try adjusting your search or filter to find what you're looking for."
//                   : "You haven't scheduled any appointments yet."}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AppointmentTracking;
