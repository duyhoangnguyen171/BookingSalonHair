
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
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WorkShiftService from "../../services/WorkShiftService";

const Workshift = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [bookedFilter, setBookedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5; // Maximum 10 shifts per page

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
      toast.error("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setRole(userRole);
    setUserId(nameId);

    if (userRole === "admin" || userRole === "staff") {
      loadShifts(nameId);
    } else {
      toast.error("Bạn không có quyền truy cập vào trang này.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  const loadShifts = async () => {
    try {
      const response = await WorkShiftService.getAll();
      const data = response?.$values ?? response;
      console.log("data:", data);

      const shiftData = Array.isArray(data) ? data : [];
      setShifts(shiftData);
      setFilteredShifts(shiftData);
    } catch (err) {
      console.error("Error loading shifts:", err);
      toast.error("Lỗi khi tải danh sách ca làm.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setShifts([]);
      setFilteredShifts([]);
    }
  };

  // Filter and search effect
  useEffect(() => {
    let filtered = [...shifts];

    // Filter by day of week
    if (selectedDay !== "") {
      filtered = filtered.filter(
        (shift) => shift.dayOfWeek === parseInt(selectedDay)
      );
    }

    // Filter by booked status
    if (bookedFilter !== "all") {
      filtered = filtered.filter(
        (shift) => shift.booked === (bookedFilter === "booked")
      );
    }

    // Search by shift name
    if (searchTerm) {
      filtered = filtered.filter((shift) =>
        shift.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredShifts(filtered);
    setPage(1); // Reset to page 1 when filters or search changes
  }, [selectedDay, bookedFilter, searchTerm, shifts]);

  const handleDeleteShift = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa ca làm này?")) {
      try {
        await WorkShiftService.delete(id);
         toast.success("Xóa ca làm thành công.");
        loadShifts();
      } catch (err) {
        toast.error("Lỗi khi xóa ca làm.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleRegisterShift = (shift) => {
    const path = role === "admin" 
      ? `/admin/workshifts/register?shiftId=${shift.id}`
      : `/staff/workshifts/register?shiftId=${shift.id}`;
    navigate(path);
  };

  const handleEditShift = (shift) => {
    window.location.href = `http://localhost:3001/admin/workshifts/edit/${shift.id}`;
  };

  const handleViewDetails = (shiftId) => {
    console.log("Shift ID:", shiftId);
    window.location.href = `http://localhost:3001/admin/workshifts/details/view/${shiftId}`;
  };

  // Hàm tính ngày cụ thể dựa trên dayOfWeek
  const getSpecificDate = (dayOfWeek) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Chủ Nhật) đến 6 (Thứ Bảy)
    const diff = dayOfWeek - currentDay; // Tính khoảng cách đến ngày cần tìm
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff); // Cộng/trừ số ngày để đến đúng thứ

    // Định dạng ngày theo dạng DD/MM/YYYY
    const day = String(targetDate.getDate()).padStart(2, "0");
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const year = targetDate.getFullYear();
    return `${day}/${month}/${year}`;
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate pagination
  const paginatedShifts = filteredShifts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredShifts.length / rowsPerPage);

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", mt: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Danh sách ca làm
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Lọc theo thứ</InputLabel>
            <Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              label="Lọc theo thứ"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">Thứ Hai</MenuItem>
              <MenuItem value="2">Thứ Ba</MenuItem>
              <MenuItem value="3">Thứ Tư</MenuItem>
              <MenuItem value="4">Thứ Năm</MenuItem>
              <MenuItem value="5">Thứ Sáu</MenuItem>
              <MenuItem value="6">Thứ Bảy</MenuItem>
              <MenuItem value="0">Chủ Nhật</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={bookedFilter}
              onChange={(e) => setBookedFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="booked">Đã đăng ký</MenuItem>
              <MenuItem value="unbooked">Chưa đăng ký</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tìm kiếm theo tên ca"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          />
        </Stack>

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

        {filteredShifts.length === 0 ? (
          <Typography color="text.secondary">Không có ca làm nào.</Typography>
        ) : (
          <>
            <List>
              {paginatedShifts.map((shift) => (
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
                    }, Ngày: ${getSpecificDate(shift.dayOfWeek)} (${
                      getDayName(shift.dayOfWeek)
                    }), Số người tối đa: ${shift.maxUsers}`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => handleViewDetails(shift.id)}
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
                          onClick={() => handleRegisterShift(shift)}
                        >
                          Đăng ký
                        </Button>
                      )}
                  </Stack>
                </ListItem>
              ))}
            </List>

            {filteredShifts.length > 0 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ mt: 2 }}
                siblingCount={1}
                boundaryCount={1}
              />
            )}
          </>
        )}
      </Paper>
      <ToastContainer />
    </Box>
  );
};

export default Workshift;