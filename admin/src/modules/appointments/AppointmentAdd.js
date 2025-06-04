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
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/AppointmentService";
import { getStaff, createGuest } from "../../services/UserService";
import ServiceService from "../../services/Serviceservice";
import WorkShiftService from "../../services/WorkShiftService";

const AppointmentAdd = ({ open, onClose, onSuccess, currentUserId }) => {
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: "",
    customerId: "",
    staffId: "",
    serviceIds: [],
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
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setErrorMessage("");
      setAppointmentData({
        appointmentDate: "",
        customerId: "",
        staffId: "",
        serviceIds: [],
        workShiftId: "",
        notes: "",
        status: 0,
      });
      setGuestData({ phone: "", fullName: "" });
      setIsGuest(false);
      setStaffList([]);
      setWorkShifts([]);
      setServiceList([]);
      fetchServices();
    }
  }, [open]);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await ServiceService.getAll();
      const services = response.data?.$values || response.data || [];
      if (!services.length) {
        setErrorMessage("Không có dịch vụ nào.");
      }
      setServiceList(services);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error.response || error);
      setErrorMessage("Lỗi khi lấy danh sách dịch vụ.");
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch work shifts based on selected date
  useEffect(() => {
    if (!appointmentData.appointmentDate) {
      setWorkShifts([]);
      setAppointmentData((prev) => ({ ...prev, workShiftId: "" }));
      setStaffList([]);
      return;
    }

    const fetchShifts = async () => {
      setLoadingShifts(true);
      try {
        const selectedDate = new Date(appointmentData.appointmentDate);
        const dayOfWeek = selectedDate.getDay();
        const response = await WorkShiftService.getAll();
        const shifts = response?.$values ?? response ?? [];
        const filteredShifts = shifts.filter(
          (shift) => shift.dayOfWeek === dayOfWeek
        );
        if (filteredShifts.length) {
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
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, [appointmentData.appointmentDate]);

  // Fetch staff when workShiftId changes
  useEffect(() => {
    if (!appointmentData.workShiftId) {
      setStaffList([]);
      setAppointmentData((prev) => ({ ...prev, staffId: "" }));
      return;
    }

    const fetchStaff = async () => {
      setLoadingStaff(true);
      try {
        const shift = await WorkShiftService.getById(appointmentData.workShiftId);
        if (!shift || !shift.id) {
          setStaffList([]);
          setErrorMessage("Ca làm không tồn tại.");
          return;
        }

        const staffData = shift.registeredStaffs?.$values ?? shift.registeredStaffs ?? [];
        const formattedStaffList = staffData
          .filter((staff) => staff && staff.id)
          .map((staff) => ({
            id: staff.id,
            fullName: staff.fullName || `Nhân viên ${staff.id}`,
          }));

        if (formattedStaffList.length) {
          setStaffList(formattedStaffList);
          setErrorMessage("");
        } else {
          setStaffList([]);
          setErrorMessage("Không có nhân viên nào đăng ký cho ca làm này.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết ca làm:", error.response || error);
        setStaffList([]);
        setErrorMessage("Lỗi khi lấy danh sách nhân viên.");
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [appointmentData.workShiftId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "serviceIds") {
      setAppointmentData((prev) => ({
        ...prev,
        [name]: typeof value === "string" ? value.split(",") : value,
      }));
    } else {
      setAppointmentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({ ...prev, [name]: value }));
  };

  // Create guest and update customerId
  const handleGuestSelection = async () => {
    if (!guestData.phone || !guestData.fullName) {
      setErrorMessage("Vui lòng nhập đầy đủ số điện thoại và tên khách vãng lai.");
      return;
    }

    setLoadingGuest(true);
    setErrorMessage("");
    try {
      let existingGuest = await createGuest(guestData);
      if (!existingGuest) {
        existingGuest = await createGuest(guestData);
      }
      if (existingGuest && existingGuest.id) {
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
      setErrorMessage("Lỗi khi tạo khách vãng lai. Vui lòng thử lại.");
    } finally {
      setLoadingGuest(false);
    }
  };

  // Validate appointment date-time within selected work shift time range
  const validateAppointmentTime = () => {
    if (!appointmentData.appointmentDate || !appointmentData.workShiftId) return true;

    const selectedDate = new Date(appointmentData.appointmentDate);
    const shift = workShifts.find((s) => s.id === appointmentData.workShiftId);
    if (!shift) return false;

    // Compose start and end datetime with appointment date
    const startDateTime = new Date(`${selectedDate.toDateString()} ${shift.startTime}`);
    const endDateTime = new Date(`${selectedDate.toDateString()} ${shift.endTime}`);

    return selectedDate >= startDateTime && selectedDate <= endDateTime;
  };

  // Submit appointment
  const handleSubmit = async () => {
    setErrorMessage("");

    if (
      !appointmentData.appointmentDate ||
      !appointmentData.staffId ||
      !appointmentData.serviceIds.length ||
      !appointmentData.workShiftId
    ) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin, bao gồm ca làm.");
      return;
    }

    if (!validateAppointmentTime()) {
      setErrorMessage(
        "Thời gian lịch hẹn không nằm trong khoảng thời gian của ca làm."
      );
      return;
    }

    setLoading(true);
    const payload = {
      ...appointmentData,
      customerId: appointmentData.customerId || currentUserId,
      appointmentDate: new Date(appointmentData.appointmentDate).toISOString(),
    };

    try {
      await AppointmentService.create(payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm lịch hẹn:", error.response || error);
      setErrorMessage("Lỗi khi thêm lịch hẹn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Thêm lịch hẹn</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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
            disabled={loading}
          />

          <FormControl fullWidth disabled={loadingShifts || loading}>
            <InputLabel>Ca làm</InputLabel>
            <Select
              name="workShiftId"
              value={appointmentData.workShiftId}
              onChange={handleChange}
              label="Ca làm"
            >
              {loadingShifts ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : workShifts.length > 0 ? (
                workShifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Không có ca làm phù hợp</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={loadingStaff || loading}>
            <InputLabel>Nhân viên</InputLabel>
            <Select
              name="staffId"
              value={appointmentData.staffId}
              onChange={handleChange}
              label="Nhân viên"
            >
              {loadingStaff ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : staffList.length > 0 ? (
                staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Chưa có nhân viên</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={loadingServices || loading}>
            <InputLabel>Dịch vụ</InputLabel>
            <Select
              multiple
              name="serviceIds"
              value={appointmentData.serviceIds}
              onChange={handleChange}
              input={<OutlinedInput label="Dịch vụ" />}
              renderValue={(selected) =>
                serviceList
                  .filter((service) => selected.includes(service.id))
                  .map((service) => service.name)
                  .join(", ")
              }
            >
              {loadingServices ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                serviceList.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    <Checkbox checked={appointmentData.serviceIds.includes(service.id)} />
                    <ListItemText primary={service.name} />
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            label="Ghi chú"
            name="notes"
            value={appointmentData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={loading}
          />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Checkbox
              checked={isGuest}
              onChange={(e) => setIsGuest(e.target.checked)}
              disabled={loading}
            />
            <Typography variant="body2">Khách vãng lai</Typography>
          </Stack>

          {isGuest && (
            <>
              <TextField
                label="Số điện thoại"
                name="phone"
                value={guestData.phone}
                onChange={handleGuestChange}
                disabled={loadingGuest || loading}
                fullWidth
              />
              <TextField
                label="Họ và tên"
                name="fullName"
                value={guestData.fullName}
                onChange={handleGuestChange}
                disabled={loadingGuest || loading}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleGuestSelection}
                disabled={loadingGuest || loading}
              >
                {loadingGuest ? <CircularProgress size={20} /> : "Tạo khách vãng lai"}
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentAdd;
