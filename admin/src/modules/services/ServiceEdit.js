import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import ServiceService from "../../services/Serviceservice";
import axios from "axios";

const getToken = () => localStorage.getItem("token");

const ServiceEdit = ({ open, onClose, serviceId, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    price: "",
    description: "",
    durationMinutes: "",
  });

  useEffect(() => {
    if (open && serviceId) {
      ServiceService.getById(serviceId)
        .then((response) => {
          const { id, name, price, description, durationMinutes } =
            response.data;
          setFormData({
            id: id || 0,
            name: name || "",
            price: price || "",
            description: description || "",
            durationMinutes: durationMinutes || "",
          });
        })
        .catch((error) => {
          console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
          alert("Không thể lấy thông tin dịch vụ.");
        });
    }
  }, [open, serviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const token = getToken();
    if (!token) {
      alert("Vui lòng đăng nhập để cập nhật dịch vụ.");
      return;
    }

    const submitData = {
      id: serviceId,
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      durationMinutes: Number(formData.durationMinutes),
      appointments: null, // có thể bỏ qua nếu phía server xử lý null
    };

    axios
      .put(`https://localhost:7169/api/services/${serviceId}`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        console.error(
          "Lỗi khi cập nhật dịch vụ:",
          error.response?.data || error.message
        );
        alert("Cập nhật dịch vụ thất bại. Vui lòng thử lại.");
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật dịch vụ</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Tên dịch vụ"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Giá"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Thời gian (phút)"
          name="durationMinutes"
          type="number"
          value={formData.durationMinutes}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceEdit;
