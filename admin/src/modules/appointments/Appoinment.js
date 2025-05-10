import React, { useEffect, useState } from "react";
import AppointmentService from "../../services/AppointmentService";
import * as UserService from "../../services/UserService"; // Giả sử có service này để lấy danh sách khách hàng
import ServiceService from "../../services/Serviceservice";
import { Button, Stack } from "@mui/material";
import AppointmentAdd from "./AppointmentAdd";
import AppointmentEdit from "./AppointmentEdit";

export const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staffs, setStaffs] = useState([]); // Dữ liệu người dùng (khách hàng)
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    // Lấy danh sách cuộc hẹn
    AppointmentService.getAll()
      .then((res) => {
        setAppointments(res.data.$values);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu cuộc hẹn");
        setLoading(false);
      });

    // Lấy danh sách khách hàng (users)
    

    // Lấy danh sách dịch vụ
    ServiceService.getAll()
      .then((res) => {
        setServices(res.data.$values);
      })
      .catch(() => setError("Không thể tải dữ liệu dịch vụ"));
  }, []);

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.fullName : "Chưa xác định";
  };
  const getStaffName = (staffId) => {
    const staff = staffs.find((c) => c.id === staffId);
    return staff ? staff.fullName : "Chưa xác định";
  };
  useEffect(() => {
    UserService.getUsers()
      .then((res) => {
        console.log('Fetched Users:', res);
        if (res && res.$values) {
          setCustomers(res.$values);
          setStaffs(res.$values); // Truy cập vào $values để lấy dữ liệu người dùng
        } else {
          setError("Dữ liệu người dùng không hợp lệ");
        }
      })
      .catch((err) => {
        console.error('Lỗi khi lấy dữ liệu người dùng:', err);
        setError("Không thể tải dữ liệu người dùng");
      });
  }, []);
  const getStatusText = (status) => {
    const statusMap = {
      1: "Chờ xác nhận",
      2: "Đã xác nhận",
      3: "Đã hoàn thành",
      4: "Đã hủy",
    };
    return statusMap[status] || "Chưa xác định";
  };

  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleString();
  };
  const handleCancel = (appointmentId) => {
    console.log("Canceling appointment:", appointmentId);
    // Thực hiện hành động hủy lịch hẹn tại đây, ví dụ như gọi API hủy lịch hẹn
    AppointmentService.cancelAppointment(appointmentId) // Giả sử bạn có phương thức cancelAppointment trong AppointmentService
      .then(() => {
        // Cập nhật lại danh sách cuộc hẹn sau khi hủy thành công
        setAppointments(appointments.filter((app) => app.id !== appointmentId));
      })
      .catch((err) => {
        setError("Không thể hủy cuộc hẹn");
      });
  };

  const handleEdit = (appointmentId) => {
    const appointmentToEdit = appointments.find(
      (app) => app.id === appointmentId
    );
    setSelectedAppointment(appointmentToEdit);
    setSelectedAppointmentId(appointmentId);
    setOpenEditDialog(true);
  };

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Danh sách cuộc hẹn</h2>
      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddClick}
          startIcon={<i className="fas fa-plus"></i>}
        >
          Thêm lịch hẹn
        </Button>
      </div>

      {appointments.length === 0 ? (
        <p>Không có cuộc hẹn nào.</p>
      ) : (
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Tên khách hàng</th>
              <th scope="col">Nhân viên</th>
              <th scope="col">Thời gian</th>
              <th scope="col">Dịch vụ</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app, index) => (
              <tr key={app.id}>
                <th scope="row">{index + 1}</th>
                <td>{getCustomerName(app.customerId)}</td>{" "}
                <td>{getStaffName(app.staffId)}</td>{" "}
                {/* Hiển thị tên khách hàng */}
                <td>{formatDate(app.appointmentDate)}</td>
                <td>
                  {services.find((s) => s.id === app.serviceId)?.name ||
                    "Không rõ"}
                </td>
                <td>{getStatusText(app.status)}</td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" color="info" size="small">
                      Xem
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleEdit(app.id)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleCancel(app.id)} // Gọi hàm handleCancel
                    >
                      Hủy
                    </Button>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AppointmentAdd
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSuccess={handleCloseAddDialog}
      />

      {selectedAppointment && (
        <AppointmentEdit
          appointment={selectedAppointment}
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          onSuccess={handleCloseEditDialog}
        />
      )}
    </div>
  );
};
