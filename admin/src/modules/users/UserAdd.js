import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import { addUser } from "../../services/UserService";

const UserAdd = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  const roles = ["Admin", "Staff", "Customer"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addUser(formData);
      alert("✅ Thêm người dùng thành công!");
      onSuccess(); // gọi lại loadUsers + đóng modal
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "",
      });
    } catch (error) {
      console.error("❌ Lỗi khi thêm người dùng:", error);
      alert("Thêm người dùng thất bại.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-user-modal"
      aria-describedby="add-user-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="add-user-modal" variant="h6" component="h2" gutterBottom>
          Thêm người dùng
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Họ tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Vai trò"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={onClose} color="secondary" style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Thêm
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default UserAdd;
