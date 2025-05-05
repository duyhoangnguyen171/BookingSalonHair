import React, { useEffect, useState } from "react";
import AppointmentService from "../../services/AppointmentService";
import { Button, Stack } from "@mui/material";
import AppointmentAdd from "./AppointmentAdd"; // Import modal thêm lịch hẹn
import AppointmentEdit from "./AppointmentEdit"; // Import modal chỉnh sửa lịch hẹn

export const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false); // Quản lý modal thêm lịch hẹn
  const [openEditDialog, setOpenEditDialog] = useState(false); // Quản lý modal chỉnh sửa lịch hẹn
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Dữ liệu cuộc hẹn đang được chỉnh sửa

  useEffect(() => {
    AppointmentService.getAll()
      .then((res) => {
        setAppointments(res.data.$values);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu cuộc hẹn");
        setLoading(false);
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

  const handleEdit = (appointmentId) => {
    const appointmentToEdit = appointments.find(
      (app) => app.id === appointmentId
    ); // Lấy dữ liệu cuộc hẹn cần chỉnh sửa
    setSelectedAppointment(appointmentToEdit); // Lưu dữ liệu vào state
    setSelectedAppointmentId(appointmentId); // Lưu ID cuộc hẹn
    setOpenEditDialog(true); // Mở modal chỉnh sửa
  };

  const handleCancel = (appointmentId) => {
    console.log("Canceling appointment:", appointmentId);
  };

  const handleAddClick = () => {
    setOpenAddDialog(true); // Mở modal khi nhấn nút Thêm lịch hẹn
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false); // Đóng modal thêm lịch hẹn
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false); // Đóng modal chỉnh sửa
    setSelectedAppointmentId(null); // Reset ID cuộc hẹn sau khi đóng modal
    setSelectedAppointment(null); // Reset dữ liệu cuộc hẹn sau khi đóng modal
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

      {/* Nút Thêm lịch hẹn */}
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
                <td>
                  {app.customer ? app.customer.fullName : "Chưa có khách hàng"}
                </td>{" "}
                {/* Kiểm tra nếu app.customer tồn tại */}
                <td>{formatDate(app.appointmentDate)}</td>
                <td>
                  {app.service ? app.service.name : "Chưa có dịch vụ"}
                </td>{" "}
                {/* Kiểm tra nếu app.service tồn tại */}
                <td>{getStatusText(app.status)}</td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      // onClick={() => handleView(app.id)}
                    >
                      Xem
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleEdit(app.id)} // Mở modal chỉnh sửa
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleCancel(app.id)}
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

      {/* Modal Thêm lịch hẹn */}
      <AppointmentAdd
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSuccess={handleCloseAddDialog}
      />

      {/* Modal Chỉnh sửa lịch hẹn */}
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
