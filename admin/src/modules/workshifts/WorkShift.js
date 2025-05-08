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
import { useNavigate } from "react-router-dom";
import WorkShiftService from "../../services/WorkShiftService";

const Workshift = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedDay, setSelectedDay] = useState(""); // Thêm để lọc theo thứ

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

    if (userRole === "admin" || userRole === "staff") {
      loadShifts(nameId);
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

  const handleRegisterShift = (shift) => {
    navigate(`/admin/workshifts/register?shiftId=${shift.id}`);
  };
  const handleEditShift = (shift) => {
    window.location.href = `http://localhost:3001/admin/workshifts/edit/${shift.id}`;
  };
  const handleViewDetails = (shiftId) => {
    console.log("Shift ID:", shiftId); // Kiểm tra xem shift.id có giá trị hợp lệ không
    window.location.href = `http://localhost:3001/admin/workshifts/details/view/${shiftId}`;
  };

  // const handleRegisterShift = async (shiftId) => {
  //   if (!userId) return;
  //   try {
  //     await WorkShiftService.registerShift(userId, shiftId);
  //     loadBookedShifts(userId);
  //   } catch (err) {
  //     console.error("Lỗi khi đăng ký ca làm:", err);
  //     alert("Không thể đăng ký ca làm.");
  //   }
  // };

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

        {/* Dropdown lọc theo thứ */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Lọc theo thứ:</Typography>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "4px",
            }}
          >
            <option value="">Tất cả</option>
            <option value="1">Thứ Hai</option>
            <option value="2">Thứ Ba</option>
            <option value="3">Thứ Tư</option>
            <option value="4">Thứ Năm</option>
            <option value="5">Thứ Sáu</option>
            <option value="6">Thứ Bảy</option>
            <option value="0">Chủ Nhật</option>
          </select>
        </Box>

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
            {shifts
              .filter((shift) =>
                selectedDay === ""
                  ? true
                  : shift.dayOfWeek === parseInt(selectedDay)
              )
              .map((shift) => (
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
                    secondary={`Thời gian: ${shift.startTime} - ${
                      shift.endTime
                    }, Thứ: ${getDayName(shift.dayOfWeek)}, Số người tối đa: ${
                      shift.maxUsers
                    }`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => {
                        console.log("Button clicked");
                        handleViewDetails(shift.id);
                      }}
                    >
                      Xem
                    </Button>

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

                    {(role === "staff" || role === "admin") &&
                      !shift.booked && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>  handleRegisterShift(shift)}
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
