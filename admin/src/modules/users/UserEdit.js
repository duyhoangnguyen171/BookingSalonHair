import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { getUserById, updateUser } from "../../services/UserService";

const UserEdit = ({ open, onClose, userId, onSuccess }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    if (userId && open) {
      getUserById(userId).then((user) => {
        if (user) {
          setForm({
            id: user.id || "",
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "",
          });
        }
      });
    }
  }, [userId, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    debugger
    try {
      await updateUser(userId, form);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Sửa người dùng</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            name="fullName"
            label="Họ tên"
            value={form.fullName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="phone"
            label="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            fullWidth
          />
          {/* Role is now displayed as a non-editable TextField */}
          <TextField
            name="role"
            label="Vai trò"
            value={form.role}
            InputProps={{
              readOnly: true, // Make the field read-only
            }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserEdit.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};

export default UserEdit;
