import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import AppointmentService from '../../services/AppointmentService';

const AppointmentEdit = ({ appointment, open, onClose, onSuccess }) => {
  const [appointmentStatus, setAppointmentStatus] = useState("");
  const [newDate, setNewDate] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(""); // Khai báo state cho ID nhân viên
  const [selectedServiceId, setSelectedServiceId] = useState(""); // Khai báo state cho ID dịch vụ
  const [selectedCustomerId, setSelectedCustomerId] = useState(""); // Khai báo state cho ID khách hàng
  const [appointmentId, setAppointmentId] = useState("");
  const [status, setStatus] = useState("");
  const [editedAppointment, setEditedAppointment] = useState({
    ...appointment,
  });

  useEffect(() => {
    setEditedAppointment({ ...appointment });
    setStatus(appointment.status);
    setAppointmentId(appointment.id); // Giả sử appointment có id
  }, [appointment]);

  const handleSave = async () => {
    try {
      const updatedData = {
        status: appointmentStatus, // Trạng thái cuộc hẹn
        notes: "Updated notes if any", // Ghi chú mới (nếu có)
        staffId: selectedStaffId, // ID nhân viên đã chọn
        serviceId: selectedServiceId, // ID dịch vụ đã chọn
        customerId: selectedCustomerId, // ID khách hàng đã chọn
      };

      const response = await AppointmentService.update(appointmentId, updatedData);
      console.log('API Response:', response);
      alert("Appointment updated successfully");
      if (onSuccess) onSuccess(); // Gọi hàm onSuccess nếu có

    } catch (error) {
      if (error.response && error.response.data.errors) {
        console.error("Validation Errors:", error.response.data.errors);
        alert("Validation failed. Please check console for details.");
      } else {
        console.error("Error updating appointment:", error.message);
        alert("Failed to update appointment. Please check console for more details.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAppointment((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setAppointmentStatus(e.target.value); // Cập nhật appointmentStatus khi trạng thái thay đổi
  };

  if (!appointment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ height: "100vh" }}
    >
      <DialogTitle>Edit Appointment</DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <TextField
          label="Customer Name"
          name="customer.fullName"
          fullWidth
          value={editedAppointment.customer.fullName}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Service"
          name="service.name"
          fullWidth
          value={editedAppointment.service.name}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Appointment Time"
          type="datetime-local"
          name="appointmentDate"
          fullWidth
          value={editedAppointment.appointmentDate}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={appointmentStatus}
            onChange={handleStatusChange} // Cập nhật trạng thái khi thay đổi
            label="Trạng thái"
          >
            <MenuItem value={1}>Chờ xác nhận</MenuItem>
            <MenuItem value={2}>Đã xác nhận</MenuItem>
            <MenuItem value={3}>Đã hoàn thành</MenuItem>
            <MenuItem value={4}>Đã hủy</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Staff</InputLabel>
          <Select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)} // Cập nhật ID nhân viên khi thay đổi
            label="Staff"
          >
            {/* MenuItem giả định cho Staff */}
            <MenuItem value={1}>Staff 1</MenuItem>
            <MenuItem value={2}>Staff 2</MenuItem>
            <MenuItem value={3}>Staff 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Service</InputLabel>
          <Select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)} // Cập nhật ID dịch vụ khi thay đổi
            label="Service"
          >
            {/* MenuItem giả định cho Service */}
            <MenuItem value={1}>Service 1</MenuItem>
            <MenuItem value={2}>Service 2</MenuItem>
            <MenuItem value={3}>Service 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Customer</InputLabel>
          <Select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)} // Cập nhật ID khách hàng khi thay đổi
            label="Customer"
          >
            {/* MenuItem giả định cho Customer */}
            <MenuItem value={1}>Customer 1</MenuItem>
            <MenuItem value={2}>Customer 2</MenuItem>
            <MenuItem value={3}>Customer 3</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentEdit;
