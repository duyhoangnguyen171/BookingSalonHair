import React, { useEffect, useState } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import WorkShiftService from "../../services/WorkShiftService";

const Workshift = () => {
  const [shifts, setShifts] = useState([]);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập.");
      return;
    }

    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const userRole =
      payload["role"] ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const nameId =
      payload["nameid"] ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/name"];

    if (!userRole || !nameId) {
      alert("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    setRole(userRole);
    setUserId(nameId);

    if (userRole === "admin"||userRole === "staff" ) {
     loadShifts(nameId);
    } else if (userRole === "staff" ) {
      loadBookedShifts();
    } else {
      alert("Bạn không có quyền truy cập vào trang này.");
    }
  }, []);

  const loadShifts = async () => {
    try {
      const response = await WorkShiftService.getAll();
      const data = response?.$values ?? response;
      setShifts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading shifts:", err);
      setShifts([]);
    }
  };

  const loadBookedShifts = async (staffId) => {
    try {
      const response = await WorkShiftService.getBookedByStaffId(staffId);
      const data = response?.$values ?? response;
      setShifts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading booked shifts:", err);
      setShifts([]);
    }
  };

  const handleDeleteShift = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa ca làm này?")) {
      try {
        await WorkShiftService.delete(id);
        loadShifts();
      } catch (err) {
        alert("Lỗi khi xóa ca làm.");
      }
    }
  };

  const handleEditShift = (shift) => {
    window.location.href = `http://localhost:3001/admin/workshifts/edit/${shift.id}`;
  };

  const handleRegisterShift = async (shiftId) => {
    if (!userId) return;
    try {
      await WorkShiftService.registerShift(userId, shiftId);
      loadBookedShifts(userId);
    } catch (err) {
      console.error("Lỗi khi đăng ký ca làm:", err);
      alert("Không thể đăng ký ca làm.");
    }
  };

  const getDayName = (dayNumber) => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return days[dayNumber] || `Thứ ${dayNumber}`;
  };

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Danh sách ca làm
        </Typography>

        {role === "admin" && (
          <Button
            variant="contained"
            onClick={() =>
              (window.location.href =
                "http://localhost:3001/admin/workshifts/create")
            }
            sx={{ mb: 2 }}
          >
            Tạo ca làm
          </Button>
        )}

        <Divider sx={{ mb: 2 }} />

        {shifts.length === 0 ? (
          <Typography color="text.secondary">Không có ca làm nào.</Typography>
        ) : (
          <List>
            {shifts.map((shift) => (
              <ListItem
                key={shift.id}
                sx={{
                  bgcolor: "#f9f9f9",
                  mb: 1,
                  borderRadius: 2,
                  border: "1px solid #ddd",
                }}
              >
                <ListItemText
                  primary={<strong>{shift.name}</strong>}
                  secondary={`Thời gian: ${shift.startTime} - ${shift.endTime}, Thứ: ${getDayName(
                    shift.dayOfWeek
                  )}, Số người tối đa: ${shift.maxUsers}`}
                />
                <Stack direction="row" spacing={1}>
                  {role === "admin" && (
                    <>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleEditShift(shift)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteShift(shift.id)}
                      >
                        Xoá
                      </Button>
                    </>
                  )}
                  {role === "staff" && !shift.booked && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRegisterShift(shift.id)}
                    >
                      Đăng ký
                    </Button>
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Workshift;
