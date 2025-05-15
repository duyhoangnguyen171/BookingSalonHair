
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
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/AppointmentService";
import { getStaff, createGuest, getUserById } from "../../services/UserService";
import ServiceService from "../../services/Serviceservice";
import WorkShiftService from "../../services/WorkShiftService";

const AppointmentEdit = ({
  open,
  onClose,
  onSuccess,
  appointmentId,
  initialData,
}) => {
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: "",
    customerId: "",
    staffId: "",
    serviceId: "",
    workShiftId: "",
    notes: "",
    status: 0,
  });
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [workShifts, setWorkShifts] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState({
    phone: "",
    fullName: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Initialize form with initialData or fetch from API
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        let appointment = initialData;

        if (!appointment || !appointment.id) {
          if (!appointmentId) {
            throw new Error("Không có ID lịch hẹn để tải dữ liệu.");
          }
          const response = await AppointmentService.getById(appointmentId);
          appointment = response;
        }

        console.log("Fetched appointment:", appointment);
        console.log("Raw appointmentDate from server:", appointment.appointmentDate);

        // Parse appointmentDate
        let date;
        if (typeof appointment.appointmentDate === 'string') {
          if (appointment.appointmentDate.includes('T')) {
            // ISO string (e.g., "2025-05-18T09:00:00.000Z")
            date = new Date(appointment.appointmentDate);
          } else {
            // Format "5/18/2025, 9:00:00 AM" (assume UTC)
            const [datePart, timePart] = appointment.appointmentDate.split(', ');
            const [month, day, year] = datePart.split('/');
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart.replace(' AM', ':00').replace(' PM', ':00')}Z`);
          }
        } else {
          date = new Date(appointment.appointmentDate);
        }

        if (isNaN(date.getTime())) {
          throw new Error("Invalid appointmentDate format");
        }

        // Convert to local time for datetime-local input
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDate = localDate.toISOString().slice(0, 16);
        console.log("Formatted local appointmentDate for input:", formattedDate);

        setAppointmentData({
          appointmentDate: formattedDate,
          customerId: appointment.customerId || "",
          staffId: appointment.staffId || "",
          serviceId: appointment.serviceId || "",
          workShiftId: appointment.workShiftId || "",
          notes: appointment.notes || "",
          status: appointment.status || 0,
        });

        if (appointment.customerId) {
          const customerResponse = await getUserById(appointment.customerId);
          if (customerResponse.isGuest) {
            setIsGuest(true);
            setGuestData({
              fullName: customerResponse.fullName || "",
              phone: customerResponse.phone || "",
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin lịch hẹn:", error);
        setErrorMessage("Không thể tải thông tin lịch hẹn: " + error.message);
        setLoading(false);
      }
    };

    if (open && (appointmentId || initialData)) {
      fetchAppointment();
    }
  }, [open, appointmentId, initialData]);

  // Fetch service list
  useEffect(() => {
    const getAllService = async () => {
      try {
        const response = await ServiceService.getAll();
        const services = response.data?.$values || response.data;
        if (!services || services.length === 0) {
          setErrorMessage("Không có dịch vụ nào.");
        } else {
          setServiceList(services);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error.response || error);
        setErrorMessage("Lỗi khi lấy danh sách dịch vụ.");
      }
    };

    getAllService();
  }, []);

  // Fetch work shifts based on appointment date
  useEffect(() => {
    const fetchWorkShifts = async () => {
      if (!appointmentData.appointmentDate) {
        setWorkShifts([]);
        setStaffList([]);
        return;
      }

      try {
        const selectedDate = new Date(appointmentData.appointmentDate);
        const dayOfWeek = selectedDate.getDay();

        const response = await WorkShiftService.getAll();
        const shifts = response?.$values ?? response;

        const filteredShifts = Array.isArray(shifts)
          ? shifts.filter((shift) => shift.dayOfWeek === dayOfWeek)
          : [];

        if (filteredShifts.length > 0) {
          setWorkShifts(filteredShifts);
          setErrorMessage("");
        } else {
          setWorkShifts([]);
          setAppointmentData((prev) => ({ ...prev, workShiftId: "" }));
          setStaffList([]);
          setErrorMessage("Không có ca làm nào trong ngày này.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy ca làm:", error.response || error);
        setWorkShifts([]);
        setAppointmentData((prev) => ({ ...prev, workShiftId: "" }));
        setStaffList([]);
        setErrorMessage("Lỗi khi lấy danh sách ca làm.");
      }
    };

    fetchWorkShifts();
  }, [appointmentData.appointmentDate]);

  // Fetch staff list when work shift is selected
  useEffect(() => {
    const fetchStaffForShift = async () => {
      if (!appointmentData.workShiftId) {
        setStaffList([]);
        return;
      }

      try {
        const shift = await WorkShiftService.getById(appointmentData.workShiftId);
        if (!shift || !shift.id) {
          setStaffList([]);
          setErrorMessage("Ca làm không tồn tại.");
          return;
        }

        const staffData = shift.registeredStaffs?.$values ?? shift.registeredStaffs ?? [];
        if (Array.isArray(staffData) && staffData.length > 0) {
          const staffList = staffData
            .map((staff) => ({
              id: staff.id,
              fullName: staff.fullName || `Nhân viên ${staff.id}`,
            }))
            .filter((staff) => staff.id && staff.fullName);

          if (staffList.length > 0) {
            setStaffList(staffList);
            setErrorMessage("");
          } else {
            setStaffList([]);
            setErrorMessage("Không có nhân viên nào đăng ký cho ca làm này.");
          }
        } else {
          setStaffList([]);
          setErrorMessage("Không có nhân viên nào đăng ký cho ca làm này.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error.response || error);
        setStaffList([]);
        setErrorMessage(`Lỗi khi lấy danh sách nhân viên: ${error.message}`);
      }
    };

    fetchStaffForShift();
  }, [appointmentData.workShiftId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestSelection = async () => {
    if (guestData.phone && guestData.fullName) {
      try {
        const guest = { phone: guestData.phone, fullName: guestData.fullName };
        let existingGuest = await createGuest(guest);
        if (!existingGuest) existingGuest = await createGuest(guest);

        if (existingGuest) {
          setAppointmentData((prev) => ({ ...prev, customerId: existingGuest.id }));
          setIsGuest(true);
          setErrorMessage("");
        } else {
          setErrorMessage("Không thể tạo khách vãng lai.");
        }
      } catch (error) {
        console.error("Lỗi khi tạo khách vãng lai:", error);
        setErrorMessage("Lỗi khi tạo khách vãng lai. Vui lòng thử lại.");
      }
    } else {
      setErrorMessage("Vui lòng nhập đầy đủ số điện thoại và tên khách vãng lai.");
    }
  };

  const validateAppointmentTime = () => {
    if (!appointmentData.appointmentDate || !appointmentData.workShiftId) return true;
    const selectedDate = new Date(appointmentData.appointmentDate);
    const shift = workShifts.find((s) => s.id === parseInt(appointmentData.workShiftId));
    if (!shift) return false;

    const shiftDate = selectedDate.toDateString();
    const startTime = new Date(`${shiftDate} ${shift.startTime}`);
    const endTime = new Date(`${shiftDate} ${shift.endTime}`);

    console.log("Validating time:", { selectedDate, startTime, endTime });
    return selectedDate >= startTime && selectedDate <= endTime;
  };

  const handleSubmit = async () => {
    if (
      !appointmentData.appointmentDate ||
      !appointmentData.staffId ||
      !appointmentData.serviceId ||
      !appointmentData.workShiftId
    ) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin, bao gồm ca làm.");
      return;
    }

    if (!validateAppointmentTime()) {
      setErrorMessage("Thời gian lịch hẹn không nằm trong khoảng thời gian của ca làm.");
      return;
    }

    // Convert appointmentDate to UTC ISO string for server
    const appointmentDate = new Date(appointmentData.appointmentDate);
    const isoDate = appointmentDate.toISOString();
    console.log("Converted to ISO for server:", isoDate);

    const appointmentDataToSend = {
      id: appointmentId,
      appointmentDate: isoDate,
      customerId: parseInt(appointmentData.customerId),
      staffId: parseInt(appointmentData.staffId),
      serviceId: parseInt(appointmentData.serviceId),
      workShiftId: parseInt(appointmentData.workShiftId),
      notes: appointmentData.notes,
      status: parseInt(appointmentData.status),
    };

    console.log("Sending update with appointmentId:", appointmentId, "Data:", appointmentDataToSend);

    try {
      const response = await AppointmentService.update(appointmentId, appointmentDataToSend);
      console.log("Update response:", response);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch hẹn:", error.response?.data || error.message);
      setErrorMessage(`Lỗi khi cập nhật lịch hẹn: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
        <DialogContent>
          <Typography>Đang tải thông tin lịch hẹn...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {errorMessage && (
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
          )}
          <TextField
            label="Ngày giờ"
            type="datetime-local"
            fullWidth
            name="appointmentDate"
            value={appointmentData.appointmentDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Ca làm</InputLabel>
            <Select
              name="workShiftId"
              value={appointmentData.workShiftId}
              onChange={handleChange}
              label="Ca làm"
              disabled={!workShifts.length}
            >
              {workShifts.map((shift) => (
                <MenuItem key={shift.id} value={shift.id}>
                  {`${shift.name} (${shift.startTime} - ${shift.endTime})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Khách hàng"
            fullWidth
            name="customerId"
            value={appointmentData.customerId}
            onChange={handleChange}
            disabled={isGuest}
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
              disabled={!appointmentData.workShiftId || !staffList.length}
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
              <MenuItem value={1}>Chờ xác nhận</MenuItem>
              <MenuItem value={2}>Đã xác nhận</MenuItem>
              <MenuItem value={3}>Đã hoàn thành</MenuItem>
              <MenuItem value={4}>Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Cập nhật lịch hẹn
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentEdit;