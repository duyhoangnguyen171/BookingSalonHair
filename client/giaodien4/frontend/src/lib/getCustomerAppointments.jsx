import { appointments } from "../assets/data/db";

const getCustomerAppointments = (customerId) => {
  // Lọc các appointment của khách hàng theo customerId
  const customerAppointments = appointments.filter(
    (appointment) => appointment.customerId === customerId
  );

  return customerAppointments;
};
export default getCustomerAppointments;
