import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import WorkShiftService from "../../services/WorkShiftService";

const Workshift = () => {
  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState("");
  const [shiftDate, setShiftDate] = useState("");

  useEffect(() => {
 
  //  console.log("Token:", JSON.parse(localStorage.token));

        // Decode JWT để lấy role từ token
        const payloadBase64 = localStorage.token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const role = payload["role"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    // const role = localStorage.getItem("role");

      const nameId = payload["nameid"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!role || !nameId) {
      alert("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    if (role === "staff") {
      loadBookedShifts(nameId);
    } else if (role === "admin") {
      loadShifts();
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

  const handleAddShift = async () => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "staff" && userRole !== "admin") {
      alert("Bạn không có quyền thêm ca làm.");
      return;
    }

    if (!newShift || !shiftDate) {
      alert("Vui lòng nhập đầy đủ thông tin ca và ngày.");
      return;
    }

    try {
      await WorkShiftService.create({
        name: newShift,
        date: shiftDate,
      });
      setNewShift("");
      setShiftDate("");

      // Load lại ca làm phù hợp theo role
      const userId = localStorage.getItem("userId");
      if (userRole === "staff") {
        loadBookedShifts(userId);
      } else {
        loadShifts();
      }
    } catch (err) {
      console.error("Error adding shift:", err);
      alert("Lỗi khi thêm ca làm việc.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: 24,
        margin: "80px auto",
        maxWidth: 600,
        borderRadius: 8,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Danh sách ca làm
      </Typography>

      <List dense>
        {shifts.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            Không có ca làm nào được tìm thấy.
          </Typography>
        ) : (
          shifts.map((shift) => (
            <ListItem
              key={shift.id}
              secondaryAction={
                localStorage.getItem("role") === "admin" && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteShift(shift.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={shift.name}
                secondary={`Thời gian: ${shift.startTime} - ${shift.endTime}, Thứ: ${shift.dayOfWeek}`}
              />
            </ListItem>
          ))
        )}
      </List>

      <Stack spacing={2} mt={2}>
        <TextField
          label="Tên ca làm"
          value={newShift}
          onChange={(e) => setNewShift(e.target.value)}
          fullWidth
        />
        <TextField
          label="Ngày (YYYY-MM-DD)"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={shiftDate}
          onChange={(e) => setShiftDate(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAddShift}>
          Thêm ca
        </Button>
      </Stack>
    </div>
  );
};

export default Workshift;
