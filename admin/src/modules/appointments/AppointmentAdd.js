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
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  const [guestData, setGuestData] = useState({ phone: "", fullName: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

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
        toast.error("Không có dịch vụ nào.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      setServiceList(services);
    } catch {
      toast.error("Lỗi khi lấy danh sách dịch vụ.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoadingServices(false);
    }
  };

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
        const filteredShifts = shifts.filter((s) => s.dayOfWeek === dayOfWeek);
        if (filteredShifts.length) {
          setWorkShifts(filteredShifts);
          setErrorMessage("");
        } else {
          setWorkShifts([]);
          setAppointmentData((prev) => ({ ...prev, workShiftId: "" }));
          setStaffList([]);
          setErrorMessage("Không có ca làm nào trong ngày này.");
        }
      } catch {
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
      } catch {
        setStaffList([]);
        setErrorMessage("Lỗi khi lấy danh sách nhân viên.");
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [appointmentData.workShiftId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({
      ...prev,
      [name]: name === "serviceIds" ? (typeof value === "string" ? value.split(",") : value) : value,
    }));
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestSelection = async () => {
    if (!guestData.phone || !guestData.fullName) {
      setErrorMessage("Vui lòng nhập đầy đủ số điện thoại và tên khách vãng lai.");
      return;
    }
    setLoadingGuest(true);
    setErrorMessage("");
    try {
      let guest = await createGuest(guestData);
      if (!guest) guest = await createGuest(guestData);
      if (guest?.id) {
        setAppointmentData((prev) => ({ ...prev, customerId: guest.id }));
        setIsGuest(true);
        setErrorMessage("");
        toast.success("Tạo khách vãng lai thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        setErrorMessage("Không thể tạo khách vãng lai.");
      }
    } catch {
      setErrorMessage("Lỗi khi tạo khách vãng lai. Vui lòng thử lại.");
      toast.error("Lỗi khi tạo khách vãng lai.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoadingGuest(false);
    }
  };

  const validateAppointmentTime = () => {
    const date = new Date(appointmentData.appointmentDate);
    const shift = workShifts.find((s) => s.id === appointmentData.workShiftId);
    if (!date || !shift) return false;

    const start = new Date(`${date.toDateString()} ${shift.startTime}`);
    const end = new Date(`${date.toDateString()} ${shift.endTime}`);
    return date >= start && date <= end;
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    const { appointmentDate, staffId, serviceIds, workShiftId } = appointmentData;
    if (!appointmentDate || !staffId || !serviceIds.length || !workShiftId) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin, bao gồm ca làm.");
      return;
    }
    if (!validateAppointmentTime()) {
      setErrorMessage("Thời gian lịch hẹn không nằm trong khoảng thời gian của ca làm.");
      return;
    }

    setLoading(true);
    const payload = {
      ...appointmentData,
      customerId: appointmentData.customerId || currentUserId,
      appointmentDate: new Date(appointmentDate).toISOString(),
    };

    try {
      await AppointmentService.create(payload);
      toast.success("Thêm lịch hẹn thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      onSuccess();
      onClose();
    } catch {
      setErrorMessage("Lỗi khi thêm lịch hẹn. Vui lòng thử lại.");
      toast.error("Lỗi khi thêm lịch hẹn.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Thêm lịch hẹn</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorMessage && <Typography color="error">{errorMessage}</Typography>}

            <TextField
              label="Ngày giờ"
              type="datetime-local"
              name="appointmentDate"
              fullWidth
              value={appointmentData.appointmentDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={loading || loadingGuest}
            />

            <FormControl fullWidth disabled={loadingShifts || loading || loadingGuest}>
              <InputLabel>Ca làm</InputLabel>
              <Select
                name="workShiftId"
                value={appointmentData.workShiftId}
                onChange={handleChange}
                input={<OutlinedInput label="Ca làm" />}
              >
                {loadingShifts ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : workShifts.length > 0 ? (
                  workShifts.map((shift) => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {`${shift.name} (${shift.startTime} - ${shift.endTime})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có ca làm phù hợp</MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={loadingStaff || loading || loadingGuest}>
              <InputLabel>Nhân viên</InputLabel>
              <Select
                name="staffId"
                value={appointmentData.staffId}
                onChange={handleChange}
                input={<OutlinedInput label="Nhân viên" />}
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

            <FormControl fullWidth disabled={loadingServices || loading || loadingGuest}>
              <InputLabel>Dịch vụ</InputLabel>
              <Select
                multiple
                name="serviceIds"
                value={appointmentData.serviceIds}
                onChange={handleChange}
                input={<OutlinedInput label="Dịch vụ" />}
                renderValue={(selected) =>
                  serviceList
                    .filter((s) => selected.includes(s.id))
                    .map((s) => s.name)
                    .join(", ")
                }
              >
                {loadingServices ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : serviceList.length > 0 ? (
                  serviceList.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      <Checkbox checked={appointmentData.serviceIds.includes(service.id)} />
                      <ListItemText primary={service.name} />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Chưa có dịch vụ</MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="Ghi chú"
              name="notes"
              fullWidth
              multiline
              rows={3}
              value={appointmentData.notes}
              onChange={handleChange}
              disabled={loading || loadingGuest}
            />

            {!isGuest && (
              <Stack spacing={2}>
                <Typography variant="subtitle2">Khách vãng lai</Typography>
                <TextField
                  label="Họ tên"
                  name="fullName"
                  fullWidth
                  value={guestData.fullName}
                  onChange={handleGuestChange}
                  disabled={loading || loadingGuest}
                />
                <TextField
                  label="Số điện thoại"
                  name="phone"
                  fullWidth
                  value={guestData.phone}
                  onChange={handleGuestChange}
                  disabled={loading || loadingGuest}
                />
                <Button
                  variant="outlined"
                  onClick={handleGuestSelection}
                  disabled={loading || loadingGuest}
                >
                  {loadingGuest ? <CircularProgress size={24} /> : "Chọn khách vãng lai"}
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" disabled={loading || loadingGuest}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading || loadingGuest}>
            {loading ? <CircularProgress size={24} /> : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AppointmentAdd;