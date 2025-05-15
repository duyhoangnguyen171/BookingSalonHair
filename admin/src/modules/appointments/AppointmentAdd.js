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
import { getStaff, createGuest } from "../../services/UserService";
import ServiceService from "../../services/Serviceservice";
import WorkShiftService from "../../services/WorkShiftService";

const AppointmentAdd = ({ open, onClose, onSuccess }) => {
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

  // Lấy danh sách dịch vụ
  useEffect(() => {
    const getAllService = async () => {
      try {
        const response = await ServiceService.getAll();
        const services = response.data?.$values || response.data;
        console.log("Services:", services);
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

  // Lấy danh sách ca làm theo ngày
  useEffect(() => {
    const fetchWorkShifts = async () => {
      if (!appointmentData.appointmentDate) return;

      try {
        const selectedDate = new Date(appointmentData.appointmentDate);
        const dayOfWeek = selectedDate.getDay();
        console.log("Selected date:", selectedDate, "Day of week:", dayOfWeek);

        const response = await WorkShiftService.getAll();
        const shifts = response?.$values ?? response;
        console.log("All shifts from getAll:", shifts);

        const filteredShifts = Array.isArray(shifts)
          ? shifts.filter((shift) => shift.dayOfWeek === dayOfWeek)
          : [];
        console.log("Filtered shifts:", filteredShifts);

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

  // Lấy danh sách nhân viên khi chọn ca làm
  useEffect(() => {
    const fetchStaffForShift = async () => {
      if (!appointmentData.workShiftId) {
        console.log("workShiftId is empty or invalid");
        return;
      }

      console.log("Fetching staff for workShiftId:", appointmentData.workShiftId);

      try {
        const shift = await WorkShiftService.getById(appointmentData.workShiftId);
        console.log("Raw shift response from getById:", JSON.stringify(shift, null, 2));

        if (!shift || !shift.id) {
          console.warn("Shift không tồn tại hoặc dữ liệu không hợp lệ");
          setStaffList([]);
          setErrorMessage("Ca làm không tồn tại.");
          return;
        }

        const staffData = shift.registeredStaffs?.$values ?? shift.registeredStaffs ?? [];
        console.log("Extracted staffData:", JSON.stringify(staffData, null, 2));

        if (Array.isArray(staffData) && staffData.length > 0) {
          const staffList = staffData.map((staff) => {
            if (!staff.id || !staff.fullName) {
              console.warn("Dữ liệu nhân viên không hợp lệ:", staff);
              return null;
            }
            return {
              id: staff.id,
              fullName: staff.fullName || `Nhân viên ${staff.id}`,
            };
          }).filter((staff) => staff !== null);
          console.log("Mapped staffList:", JSON.stringify(staffList, null, 2));

          if (staffList.length > 0) {
            setStaffList(staffList);
            setErrorMessage("");
          } else {
            console.warn("Không có nhân viên hợp lệ sau khi ánh xạ");
            setStaffList([]);
            setErrorMessage("Không có nhân viên nào đăng ký cho ca làm này.");
          }
        } else {
          console.warn("Không có nhân viên đăng ký hoặc staffData rỗng:", staffData);
          setStaffList([]);
          setErrorMessage("Không có nhân viên nào đăng ký cho ca làm này.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết ca làm:", error.response || error);
        setStaffList([]);
        setErrorMessage(`Lỗi khi lấy danh sách nhân viên: ${error.message}`);
      }
    };

    fetchStaffForShift();
  }, [appointmentData.workShiftId]);

  // Xử lý thay đổi của các trường input
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value);
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi của form khách vãng lai
  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý khi chọn khách vãng lai
  const handleGuestSelection = async () => {
    if (guestData.phone && guestData.fullName) {
      try {
        const guest = {
          phone: guestData.phone,
          fullName: guestData.fullName,
        };

        let existingGuest = await createGuest(guest);
        if (!existingGuest) {
          existingGuest = await createGuest(guest);
        }

        if (existingGuest) {
          setAppointmentData((prev) => ({
            ...prev,
            customerId: existingGuest.id,
          }));
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

  // Kiểm tra thời gian lịch hẹn có nằm trong ca làm
  const validateAppointmentTime = () => {
    if (!appointmentData.appointmentDate || !appointmentData.workShiftId) return true;

    const selectedDate = new Date(appointmentData.appointmentDate);
    const shift = workShifts.find((s) => s.id === parseInt(appointmentData.workShiftId));
    if (!shift) return false;

    const appointmentTime = selectedDate.getTime();
    const startTime = new Date(`${selectedDate.toDateString()} ${shift.startTime}`).getTime();
    const endTime = new Date(`${selectedDate.toDateString()} ${shift.endTime}`).getTime();

    return appointmentTime >= startTime && appointmentTime <= endTime;
  };

  // Gửi dữ liệu tạo lịch hẹn
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

    const payload = {
      ...appointmentData,
      appointmentDate: new Date(appointmentData.appointmentDate).toISOString(),
    };

    console.log("Dữ liệu lịch hẹn gửi đi:", payload);

    try {
      await AppointmentService.create(payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm lịch hẹn:", error);
      setErrorMessage("Lỗi khi thêm lịch hẹn. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thêm lịch hẹn</DialogTitle>
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
            InputLabelProps={{
              shrink: true,
            }}
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