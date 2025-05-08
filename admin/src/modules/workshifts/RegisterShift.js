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
  const [shiftDetails, setShiftDetails] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shiftIdFromURL = searchParams.get("shiftId");

  useEffect(() => {
    if (shiftIdFromURL) {
      setShiftId(Number(shiftIdFromURL));
    }
  }, [shiftIdFromURL]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (shiftId) {
          const shiftResponse = await WorkShiftService.getById(shiftId);
          setShiftDetails(shiftResponse);

          const staffResponse = await WorkShiftService.getStaffNotRegistered(shiftId);
          setStaffList(staffResponse.$values || []);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
        setMessage("Không thể lấy thông tin ca làm hoặc danh sách nhân viên.");
      }
    };

    fetchData();
  }, [shiftId]);

  const handleRegisterShift = async (e) => {
    e.preventDefault();

    if (!selectedStaff) {
      setMessage("Vui lòng chọn nhân viên.");
      return;
    }

    try {
      const response = await WorkShiftService.registerShift(shiftId, selectedStaff);
      setMessage(response.message || "Đăng ký ca làm thành công!");
    } catch (error) {
      setMessage("Đã xảy ra lỗi khi đăng ký ca làm.");
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
            {shiftDetails.startTime?.slice(0, 5)} - {shiftDetails.endTime?.slice(0, 5)}
          </Typography>
        </Box>
      ) : (
        <Typography>Đang tải thông tin ca làm...</Typography>
      )}

      <form onSubmit={handleRegisterShift}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Chọn nhân viên</InputLabel>
          <Select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            width: "100%",
            paddingY: 1.2,
            fontWeight: "bold",
            borderRadius: 2,
            transition: "all 0.3s ease",
            ":hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Đăng ký ca làm
        </Button>
      </form>

      {message && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {message}
        </Alert>
      )}
    </Paper>
  </Fade>
</Box>

  );
};

export default RegisterShift;
