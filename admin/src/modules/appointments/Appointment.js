import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Thêm Link
import AppointmentService from "../../services/AppointmentService";
import * as UserService from "../../services/UserService";
import ServiceService from "../../services/Serviceservice";
import { Button, Stack, TextField, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import AppointmentAdd from "./AppointmentAdd";
import AppointmentEdit from "./AppointmentEdit";
import AppointmentDetail from "./AppointmentDetail";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;

  useEffect(() => {
    AppointmentService.getAll()
      .then((res) => {
        console.log("Server response (getAll):", res);
        console.log("First appointmentDate:", res.data.$values[0]?.appointmentDate);
        setAppointments(res.data.$values);
        setFilteredAppointments(res.data.$values.filter(app => app.status !== 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu cuộc hẹn:", err);
        setError("Không thể tải dữ liệu cuộc hẹn");
        setLoading(false);
      });

    ServiceService.getAll()
      .then((res) => {
        setServices(res.data.$values);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu dịch vụ:", err);
        setError("Không thể tải dữ liệu dịch vụ");
      });
  }, []);

  useEffect(() => {
    UserService.getUsers()
      .then((res) => {
        console.log("Fetched Users:", res);
        if (res && res.$values) {
          setCustomers(res.$values);
          setStaffs(res.$values);
        } else {
          setError("Dữ liệu người dùng không hợp lệ");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu người dùng:", err);
        setError("Không thể tải dữ liệu người dùng");
      });
  }, []);

  useEffect(() => {
    let filtered = [...appointments].filter(app => app.status !== 4);

    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const customer = customers.find((c) => c.id === app.customerId);
        return customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredAppointments(filtered);
    setPage(1);
  }, [searchTerm, sortOrder, appointments, customers]);

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.fullName : "Chưa xác định";
  };

  const getStaffName = (staffId) => {
    const staff = staffs.find((c) => c.id === staffId);
    return staff ? staff.fullName : "Chưa xác định";
  };

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
    if (isNaN(newDate.getTime())) {
      console.error("Invalid date format:", date);
      return "Invalid Date";
    }
    return newDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleCancel = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setOpenCancelDialog(true);
  };

  const confirmCancel = () => {
    AppointmentService.cancelAppointment(selectedAppointmentId)
      .then(() => {
        AppointmentService.getAll()
          .then((res) => {
            console.log("Refreshed appointments (cancel):", res.data.$values);
            setAppointments(res.data.$values);
            setFilteredAppointments(res.data.$values.filter(app => app.status !== 4));
          })
          .catch((err) => {
            console.error("Lỗi khi làm mới danh sách lịch hẹn (cancel):", err);
            setError("Không thể làm mới danh sách lịch hẹn");
          });
        setOpenCancelDialog(false);
        setSelectedAppointmentId(null);
      })
      .catch((err) => {
        console.error("Lỗi khi hủy cuộc hẹn:", err);
        setError("Không thể hủy cuộc hẹn");
        setOpenCancelDialog(false);
      });
  };

  const handleCancelDialogClose = () => {
    setOpenCancelDialog(false);
    setSelectedAppointmentId(null);
  };

  const handleEdit = (appointmentId) => {
    const appointmentToEdit = appointments.find((app) => app.id === appointmentId);
    if (!appointmentToEdit) {
      console.error(`Không tìm thấy lịch hẹn với ID: ${appointmentId}`);
      alert("Lịch hẹn không tồn tại.");
      return;
    }
    setSelectedAppointment(appointmentToEdit);
    setSelectedAppointmentId(appointmentId);
    setOpenEditDialog(true);
  };

  const handleView = (appointmentId) => {
    const appointmentToView = appointments.find((app) => app.id === appointmentId);
    if (!appointmentToView) {
      console.error(`Không tìm thấy lịch hẹn với ID: ${appointmentId}`);
      alert("Lịch hẹn không tồn tại.");
      return;
    }
    setSelectedAppointment(appointmentToView);
    setOpenViewDialog(true);
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

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedAppointment(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Danh sách cuộc hẹn</h2>
      <Stack direction="row" spacing={2} className="mb-4">
        <TextField
          label="Tìm kiếm khách hàng"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
        />
        <Button variant="contained" onClick={handleSortToggle}>
          Sắp xếp theo ngày ({sortOrder === "asc" ? "Tăng" : "Giảm"})
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddClick}
          startIcon={<i className="fas fa-plus"></i>}
        >
          Thêm lịch hẹn
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/admin/appointments/canceled"
        >
          Xem thùng rác
        </Button>
      </Stack>

      {filteredAppointments.length === 0 ? (
        <p>Không có cuộc hẹn nào.</p>
      ) : (
        <>
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
              {paginatedAppointments.map((app, index) => (
                <tr key={app.id}>
                  <th scope="row">{(page - 1) * rowsPerPage + index + 1}</th>
                  <td>{getCustomerName(app.customerId)}</td>
                  <td>{getStaffName(app.staffId)}</td>
                  <td>{formatDate(app.appointmentDate)}</td>
                  <td>
                    {services.find((s) => s.id === app.serviceId)?.name || "Không rõ"}
                  </td>
                  <td>{getStatusText(app.status)}</td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => handleView(app.id)}
                      >
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
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            className="mt-4"
            siblingCount={1}
            boundaryCount={1}
          />
        </>
      )}

      <AppointmentAdd
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSuccess={() => {
          AppointmentService.getAll()
            .then((res) => {
              console.log("Refreshed appointments (add):", res.data.$values);
              setAppointments(res.data.$values);
              setFilteredAppointments(res.data.$values.filter(app => app.status !== 4));
            })
            .catch((err) => {
              console.error("Lỗi khi làm mới danh sách lịch hẹn (add):", err);
              setError("Không thể làm mới danh sách lịch hẹn");
            });
          handleCloseAddDialog();
        }}
      />

      <AppointmentEdit
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSuccess={() => {
          AppointmentService.getAll()
            .then((res) => {
              console.log("Refreshed appointments (edit):", res.data.$values);
              setAppointments(res.data.$values);
              setFilteredAppointments(res.data.$values.filter(app => app.status !== 4));
            })
            .catch((err) => {
              console.error("Lỗi khi làm mới danh sách lịch hẹn (edit):", err);
              setError("Không thể làm mới danh sách lịch hẹn");
            });
          handleCloseEditDialog();
        }}
        appointmentId={selectedAppointmentId}
        initialData={selectedAppointment}
      />

      <AppointmentDetail
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        appointment={selectedAppointment}
        customers={customers}
        staffs={staffs}
        services={services}
      />

      <Dialog open={openCancelDialog} onClose={handleCancelDialogClose}>
        <DialogTitle>Xác nhận hủy lịch hẹn</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn hủy lịch hẹn này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            Không
          </Button>
          <Button onClick={confirmCancel} color="error" autoFocus>
            Có
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Appointment;