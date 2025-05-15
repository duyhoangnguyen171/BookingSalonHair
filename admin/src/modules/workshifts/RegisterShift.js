import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import WorkShiftService from "../../services/WorkShiftService";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Fade,
  Alert,
} from "@mui/material";

const RegisterShift = () => {
  const [staffList, setStaffList] = useState([]);
  const [shiftId, setShiftId] = useState();
  const [selectedStaff, setSelectedStaff] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [shiftDetails, setShiftDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shiftIdFromURL = searchParams.get("shiftId");

  useEffect(() => {
    if (shiftIdFromURL) setShiftId(Number(shiftIdFromURL));
  }, [shiftIdFromURL]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles = payload?.role || payload?.roles || [];
        const roleArray = Array.isArray(roles) ? roles : [roles];
        setIsAdmin(roleArray.includes("admin"));
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (shiftId) {
          const shiftResponse = await WorkShiftService.getById(shiftId);
          setShiftDetails(shiftResponse);

          if (isAdmin) {
            const staffResponse = await WorkShiftService.getStaffNotRegistered(shiftId);
            setStaffList(staffResponse.$values || []);
          }
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
        setMessage("Không thể lấy thông tin ca làm hoặc danh sách nhân viên.");
        setSeverity("error");
      }
    };

    fetchData();
  }, [shiftId, isAdmin]);

  const handleRegisterShift = async (e) => {
    e.preventDefault();

    if (isAdmin && !selectedStaff) {
      setMessage("Vui lòng chọn nhân viên.");
      setSeverity("warning");
      return;
    }

    let staffIdToSend;

    if (isAdmin) {
      staffIdToSend = Number(selectedStaff);
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          staffIdToSend = Number(decoded.staffId);

          if (!staffIdToSend) {
            setMessage("Không tìm thấy mã nhân viên trong token.");
            setSeverity("error");
            return;
          }
        } catch (err) {
          setMessage("Lỗi khi đọc token.");
          setSeverity("error");
          return;
        }
      }
    }

    console.log("📤 Gửi dữ liệu:", { shiftId, staffId: staffIdToSend });

    try {
      const response = await WorkShiftService.registerShift(shiftId, staffIdToSend);

      setMessage(response.message || "Đăng ký thành công!");
      setSeverity("success");
    } catch (error) {
      setMessage(error.response?.data || "Đã xảy ra lỗi.");
      setSeverity("error");
      console.error(error);
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" padding={3}>
      <Fade in={true} timeout={600}>
        <Paper elevation={4} sx={{ padding: 3, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Đăng ký ca làm
          </Typography>

          {shiftDetails ? (
            <Box mb={2}>
              <Typography variant="subtitle1">
                <strong>Ca làm:</strong> {shiftDetails.name}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Thời gian:</strong>{" "}
                {shiftDetails.startTime?.slice(0, 5)} -{" "}
                {shiftDetails.endTime?.slice(0, 5)}
              </Typography>
            </Box>
          ) : (
            <Typography>Đang tải thông tin ca làm...</Typography>
          )}

          <form onSubmit={handleRegisterShift}>
            {isAdmin && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Chọn nhân viên</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(Number(e.target.value))}
                  label="Chọn nhân viên"
                >
                  <MenuItem value="">
                    <em>Chọn nhân viên</em>
                  </MenuItem>
                  {staffList.length > 0 ? (
                    staffList.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      Không có nhân viên nào
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2, width: "100%", fontWeight: "bold", borderRadius: 2 }}
            >
              Đăng ký ca làm
            </Button>
          </form>

          {message && (
            <Alert severity={severity} sx={{ mt: 3 }}>
              {message}
            </Alert>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default RegisterShift;
