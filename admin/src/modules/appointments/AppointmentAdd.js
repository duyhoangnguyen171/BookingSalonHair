import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/AppointmentService";
import { getStaff, createGuest } from "../../services/UserService"; // Import hàm lấy danh sách nhân viên
import ServiceService from "../../services/Serviceservice"; // ✅ ĐÚNG

const AppointmentAdd = ({ open, onClose, onSuccess }) => {
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: "",
    customerId: "",
    staffId: "",
    serviceId: "",
    notes: "",
    status: 0, // Default status is Pending (0)
  });
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [isGuest, setIsGuest] = useState(false); // Thêm biến trạng thái xác định khách vãn lai
  const [guestData, setGuestData] = useState({
    phone: "",
    fullName: "",
  });

  // Lấy danh sách nhân viên khi component được render
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffData = await getStaff();
        setStaffList(staffData); // Lưu vào state staffList
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error);
      }
    };

    fetchStaff();
  }, []);

  // Lấy danh sách dịch vụ khi component được render
  useEffect(() => {
    const getAllService = async () => {
      try {
        const response = await ServiceService.getAll();
        console.log("Dữ liệu trả về:", response); // Kiểm tra cấu trúc response

        const services = response.data?.$values || response.data; // Tùy theo API của bạn
        if (!services || services.length === 0) {
          alert("Không có dịch vụ nào.");
        } else {
          setServiceList(services);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error);
        alert("Lỗi khi lấy danh sách dịch vụ.");
      }
    };

    getAllService();
  }, []);

  // Xử lý thay đổi của các trường input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi của các trường input trong form khách vãng lai
  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm xử lý khi người dùng chọn "Khách vãn lai"
  const handleGuestSelection = async () => {
    if (guestData.phone && guestData.fullName) {
      try {
        const guest = { 
          phone: guestData.phone, 
          fullName: guestData.fullName 
        };

        // Kiểm tra xem khách vãng lai đã tồn tại chưa
        let existingGuest = await createGuest(guest);

        if (!existingGuest) {
          // Nếu không tìm thấy khách vãng lai, tạo mới
          existingGuest = await createGuest(guest);
        }

        if (existingGuest) {
          setAppointmentData((prev) => ({
            ...prev,
            customerId: existingGuest.id, // Cập nhật customerId từ phản hồi
          }));
          setIsGuest(true); // Đánh dấu là khách vãng lai
        } else {
          alert("Không thể tạo khách vãng lai.");
        }
      } catch (error) {
        console.error("Lỗi khi tạo khách vãng lai:", error);
        alert("Lỗi khi tạo khách vãng lai. Vui lòng thử lại.");
      }
    } else {
      alert("Vui lòng nhập đầy đủ số điện thoại và tên khách vãng lai.");
    }
  };

  // Hàm gửi dữ liệu tạo lịch hẹn
  const handleSubmit = async () => {
    if (!appointmentData.appointmentDate || !appointmentData.staffId || !appointmentData.serviceId) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    console.log("Dữ liệu lịch hẹn gửi đi:", appointmentData); // 👉 Xem dữ liệu tại đây

    try {
      await AppointmentService.create(appointmentData);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi thêm lịch hẹn. Vui lòng thử lại.");
      console.error("Lỗi khi thêm lịch hẹn:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm lịch hẹn</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="Ngày giờ"
            type="datetime-local"
            fullWidth
            name="appointmentDate"
            value={appointmentData.appointmentDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Khách hàng"
            fullWidth
            name="customerId"
            value={appointmentData.customerId}
            onChange={handleChange}
            disabled={isGuest} // Nếu là khách vãn lai, không cho chỉnh sửa
          />
          {!isGuest && (
            <>
              <TextField
                label="Tên khách vãng lai"
                fullWidth
                name="fullName"
                value={guestData.fullName}
                onChange={handleGuestChange}
              />
              <TextField
                label="Số điện thoại khách vãng lai"
                fullWidth
                name="phone"
                value={guestData.phone}
                onChange={handleGuestChange}
              />
              <Button variant="contained" onClick={handleGuestSelection}>
                Tạo khách vãng lai
              </Button>
            </>
          )}
          <FormControl fullWidth>
            <InputLabel>Nhân viên</InputLabel>
            <Select
              name="staffId"
              value={appointmentData.staffId}
              onChange={handleChange}
              label="Nhân viên"
            >
              {staffList.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            select
            label="Dịch vụ"
            fullWidth
            name="serviceId"
            value={appointmentData.serviceId}
            onChange={handleChange}
          >
            {serviceList.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Ghi chú"
            fullWidth
            name="notes"
            value={appointmentData.notes}
            onChange={handleChange}
            multiline
            rows={4}
          />
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={appointmentData.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              <MenuItem value={0}>Chờ duyệt</MenuItem>
              <MenuItem value={1}>Đã nhận lịch</MenuItem>
              <MenuItem value={2}>Đang thực hiện</MenuItem>
              <MenuItem value={3}>Đã hoàn thành</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Thêm lịch hẹn
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentAdd;
