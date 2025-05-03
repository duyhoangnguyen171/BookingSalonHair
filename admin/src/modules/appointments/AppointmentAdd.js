// AppointmentAdd.js
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
import AppointmentService from '../../services/AppointmentService';
import { getStaff } from '../../services/UserService'; // Import hàm lấy danh sách nhân viên

const AppointmentAdd = ({ open, onClose, onSuccess }) => {
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: "",
    customerId: "",
    staffId: "",
    serviceId: "",
    notes: "",
  });
  const [staffList, setStaffList] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Thêm lịch hẹn
      await AppointmentService.create(appointmentData);
      onSuccess(); // Callback sau khi thành công
      onClose(); // Đóng modal
    } catch (error) {
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
          />
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
            label="Dịch vụ"
            fullWidth
            name="serviceId"
            value={appointmentData.serviceId}
            onChange={handleChange}
          />
          <TextField
            label="Ghi chú"
            fullWidth
            name="notes"
            value={appointmentData.notes}
            onChange={handleChange}
            multiline
            rows={4}
          />
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
