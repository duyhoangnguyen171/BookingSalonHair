import React, { useEffect, useState } from "react";
import AppointmentService from "../../services/AppointmentService";
import '../../asset/styles/appointment/AppointmentCanceled.css';  // Import file CSS

const AppointmentCanceled = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await AppointmentService.getAll();
        
        console.log("Response data:", response.data);
        console.log("Appointments:", response.data.$values);

        // Kiểm tra và ép kiểu giá trị Status về dạng số
        const canceledAppointments = response.data.$values.filter((app) => {
          console.log("Checking appointment:", app); // Log mỗi cuộc hẹn
          return Number(app.status) === 4; // Ép kiểu status thành số để so sánh
        });

        console.log("Canceled appointments:", canceledAppointments);
        setAppointments(canceledAppointments);
      } catch (error) {
        console.error("Error fetching canceled appointments:", error);
        setAppointments([]); // Nếu có lỗi, set state là mảng rỗng
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="appointment-canceled">
      <h1>Canceled Appointments</h1>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <div key={appointment.id} className="appointment-item">
            <p className="notes">{appointment.notes || "No notes available"}</p>
            <p className="appointmentDate">
              {new Date(appointment.appointmentDate).toLocaleString()}
            </p>
            <p className="staff-id">Staff ID: {appointment.staffId}</p>
          </div>
        ))
      ) : (
        <p className="no-appointments">No canceled appointments</p>
      )}
    </div>
  );
};

export default AppointmentCanceled;
