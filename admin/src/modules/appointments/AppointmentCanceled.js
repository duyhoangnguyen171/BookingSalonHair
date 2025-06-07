import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppointmentService from "../../services/AppointmentService";
import '../../asset/styles/appointment/AppointmentCanceled.css';  // Import file CSS

const AppointmentCanceled = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true); // Set loading to true at the start
      try {
        const response = await AppointmentService.getAll();
        
        console.log("Response data:", response.data);
        console.log("Appointments:", response.data.$values);

        // Filter for canceled appointments (status === 4)
        const canceledAppointments = (response.data.$values || []).filter((app) => {
          console.log("Checking appointment:", app);
          // Safely convert status to number, handle potential undefined or non-numeric values
          const status = Number(app?.status);
          return !isNaN(status) && status === 4;
        });

        console.log("Canceled appointments:", canceledAppointments);
        setAppointments(canceledAppointments);

        // Show toast if no canceled appointments are found
        if (canceledAppointments.length === 0) {
          toast.info("No canceled appointments found.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (error) {
        console.error("Error fetching canceled appointments:", error);
        setAppointments([]);
        // Show error toast
        toast.error("Failed to fetch canceled appointments: " + (error.response?.data?.message || error.message), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };
    fetchAppointments();
  }, []);

  // Format date for better readability (adjusted for +07 timezone)
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date.toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh", // Adjust for +07 timezone
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <>
      <div className="appointment-canceled">
        <h1>Canceled Appointments</h1>
        {loading ? (
          <p className="loading">Loading canceled appointments...</p>
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-item">
              <p className="notes">{appointment.notes || "No notes available"}</p>
              <p className="appointmentDate">{formatDate(appointment.appointmentDate)}</p>
              <p className="staff-id">Staff ID: {appointment.staffId || "Not assigned"}</p>
            </div>
          ))
        ) : (
          <p className="no-appointments">No canceled appointments</p>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AppointmentCanceled;