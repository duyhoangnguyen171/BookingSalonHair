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
import React, { useState, useEffect, useCallback } from "react";
import AppointmentService from "../../services/AppointmentService";
import { getStaff, createGuest, getUserById } from "../../services/UserService";
import ServiceService from "../../services/Serviceservice";
import WorkShiftService from "../../services/WorkShiftService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  // Initialize form with initialData or fetch from API
  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
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

        let date;
        if (typeof appointment.appointmentDate === 'string') {
          if (appointment.appointmentDate.includes('T')) {
            date = new Date(appointment.appointmentDate);
          } else {
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

        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDate = localDate.toISOString().slice(0, 16);

        const serviceIds = appointment.appointmentServices?.$values?.map(s => s.serviceId) || 
                          appointment.appointmentServices?.map(s => s.serviceId) || [];

        setAppointmentData({
          appointmentDate: formattedDate,
          customerId: appointment.customerId || "",
          staffId: appointment.staffId || "",
          serviceIds: serviceIds,
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

        setErrorMessage("");
      } catch (error) {
        console.error("Lỗi khi lấy thông tin lịch hẹn:", error);
        setErrorMessage("Không thể tải thông tin lịch hẹn: " + error.message);
      } finally {
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
      setLoadingServices(true);
      try {
        const response = await ServiceService.getAll();
        const services = Array.isArray(response.data?.$values) 
          ? response.data.$values 
          : Array.isArray(response.data) 
            ? response.data 
            : [];
        if (!services.length) {
          setErrorMessage("Không có dịch vụ nào.");
        } else {
          setServiceList(services);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error.response || error);
        setErrorMessage("Lỗi khi lấy danh sách dịch vụ: " + (error.response?.data?.message || error.message));
      } finally {
        setLoadingServices(false);
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
        setAppointmentData((prev) => ({ ...prev, workShiftId: "" }));
        return;
      }

      setLoadingShifts(true);
      try {
        const selectedDate = new Date(appointmentData.appointmentDate);
        const dayOfWeek = selectedDate.getDay();

        const response = await WorkShiftService.getAll();
        const shifts = Array.isArray(response?.$values) ? response.$values : Array.isArray(response) ? response : [];

        const filteredShifts = shifts.filter((shift) => shift.dayOfWeek === dayOfWeek);

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
        setErrorMessage("Lỗi khi lấy danh sách ca làm: " + (error.response?.data?.message || error.message));
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchWorkShifts();
  }, [appointmentData.appointmentDate]);

  // Fetch staff list when work shift is selected
  useEffect(() => {
    const fetchStaffForShift = async () => {
      if (!appointmentData.workShiftId) {
        setStaffList([]);
        setAppointmentData((prev) => ({ ...prev, staffId: "" }));
        return;
      }

      setLoadingStaff(true);
      try {
        const shift = await WorkShiftService.getById(appointmentData.workShiftId);
        if (!shift || !shift.id) {
          setStaffList([]);
          setErrorMessage("Ca làm không tồn tại.");
          return;
        }

        const staffData = shift.registeredStaffs?.$values ?? shift.registeredStaffs ?? [];
        const staffList = staffData
          .filter((staff) => staff && staff.id)
          .map((staff) => ({
            id: staff.id,
            fullName: staff.fullName || `Nhân viên ${staff.id}`,
          }));

        if (staffList.length > 0) {
          setStaffList(staffList);
          setErrorMessage("");
        } else {
          setStaffList([]);
          setErrorMessage("Không có nhân viên nào đăng ký cho ca làm này.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error.response || error);
        setStaffList([]);
        setErrorMessage("Lỗi khi lấy danh sách nhân viên: " + (error.response?.data?.message || error.message));
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaffForShift();
  }, [appointmentData.workShiftId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({
      ...prev,
      [name]: name === "serviceIds" ? (typeof value === "string" ? value.split(",") : value) : value,
    }));
  }, []);

  const handleGuestChange = useCallback((e) => {
    const { name, value } = e.target;
    setGuestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleGuestSelection = async () => {
    if (!guestData.phone || !guestData.fullName) {
      setErrorMessage("Vui lòng nhập đầy đủ số điện thoại và tên khách vãng lai.");
      return;
    }

    setLoadingGuest(true);
    setErrorMessage("");
    try {
      const guest = { phone: guestData.phone, fullName: guestData.fullName };
      const existingGuest = await createGuest(guest);
      if (existingGuest && existingGuest.id) {
        setAppointmentData((prev) => ({ ...prev, customerId: existingGuest.id }));
        setIsGuest(true);
        setErrorMessage("");
      } else {
        setErrorMessage("Không thể tạo khách vãng lai.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo khách vãng lai:", error);
      setErrorMessage("Lỗi khi tạo khách vãng lai: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingGuest(false);
    }
  };

  const validateAppointmentTime = useCallback(() => {
    if (!appointmentData.appointmentDate || !appointmentData.workShiftId) return true;
    const selectedDate = new Date(appointmentData.appointmentDate);
    const shift = workShifts.find((s) => s.id === parseInt(appointmentData.workShiftId));
    if (!shift) return false;

    const shiftDate = selectedDate.toDateString();
    const startTime = new Date(`${shiftDate} ${shift.startTime}`);
    const endTime = new Date(`${shiftDate} ${shift.endTime}`);

    return selectedDate >= startTime && selectedDate <= endTime;
  }, [appointmentData.appointmentDate, appointmentData.workShiftId, workShifts]);

  const handleSubmit = async () => {
    setErrorMessage("");

    if (
      !appointmentData.appointmentDate ||
      !appointmentData.staffId ||
      !appointmentData.serviceIds.length ||
      !appointmentData.workShiftId
    ) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin, bao gồm ca làm và dịch vụ.");
      return;
    }

    if (new Date(appointmentData.appointmentDate) < new Date()) {
      setErrorMessage("Ngày giờ lịch hẹn phải là thời điểm trong tương lai.");
      return;
    }

    if (!validateAppointmentTime()) {
      setErrorMessage("Thời gian lịch hẹn không nằm trong khoảng thời gian của ca làm.");
      return;
    }

    const appointmentDate = new Date(appointmentData.appointmentDate);
    const isoDate = appointmentDate.toISOString();

    const appointmentDataToSend = {
      id: appointmentId,
      appointmentDate: isoDate,
      customerId: parseInt(appointmentData.customerId),
      staffId: parseInt(appointmentData.staffId),
      serviceIds: appointmentData.serviceIds.map(id => parseInt(id)),
      workShiftId: parseInt(appointmentData.workShiftId),
      notes: appointmentData.notes,
      status: parseInt(appointmentData.status),
    };

    console.log("Sending update with appointmentId:", appointmentId, "Data:", appointmentDataToSend);

    try {
      const response = await AppointmentService.update(appointmentId, appointmentDataToSend);
      console.log("Update response:", response);
      toast.success("Cập nhật lịch hẹn thành công!", {
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
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch hẹn:", error.response?.data || error.message);
      setErrorMessage(`Lỗi khi cập nhật lịch hẹn: ${error.response?.data?.message || error.message}`);
      toast.error("Cập nhật lịch hẹn thất bại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
        <DialogContent>
          <Typography>Đang tải thông tin lịch hẹn...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" disabled={loading}>
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
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
              disabled={loading || loadingGuest}
            />
            <FormControl fullWidth disabled={loadingShifts || loading || loadingGuest}>
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
                      {`${shift.name} (${shift.startTime} - ${shift.endTime})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có ca làm phù hợp</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              label="Khách hàng"
              fullWidth
              name="customerId"
              value={appointmentData.customerId}
              onChange={handleChange}
              disabled={isGuest || loading || loadingGuest}
            />
            {!isGuest && (
              <Stack spacing={2}>
                <TextField
                  label="Tên khách vãng lai"
                  fullWidth
                  name="fullName"
                  value={guestData.fullName}
                  onChange={handleGuestChange}
                  disabled={loading || loadingGuest}
                />
                <TextField
                  label="Số điện thoại khách vãng lai"
                  fullWidth
                  name="phone"
                  value={guestData.phone}
                  onChange={handleGuestChange}
                  disabled={loading || loadingGuest}
                />
                <Button
                  variant="contained"
                  onClick={handleGuestSelection}
                  disabled={loading || loadingGuest}
                >
                  {loadingGuest ? <CircularProgress size={20} /> : "Tạo khách vãng lai"}
                </Button>
              </Stack>
            )}
            <FormControl fullWidth disabled={loadingStaff || loading || loadingGuest}>
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
                    .filter((service) => selected.includes(service.id))
                    .map((service) => service.name)
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
              fullWidth
              name="notes"
              value={appointmentData.notes}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={loading || loadingGuest}
            />
            <FormControl fullWidth disabled={loading || loadingGuest}>
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
          <Button onClick={onClose} color="primary" disabled={loading || loadingGuest}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading || loadingGuest}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Cập nhật lịch hẹn"}
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

export default AppointmentEdit;