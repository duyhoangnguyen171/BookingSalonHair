import React, { useState } from "react";
import { Button, TextField, Modal, Stack, Typography } from "@mui/material";
import ServiceService from "../../services/Serviceservice";

const ServiceAdd = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleAddService = async () => {
    // Kiểm tra thông tin nhập vào
    if (!name || !price || !description) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const serviceData = {
      name,
      price,
      description,
    };

    try {
      await ServiceService.create(serviceData);
      onSuccess(); // Gọi hàm onSuccess để reload danh sách dịch vụ
      setName(""); // Reset form
      setPrice("");
      setDescription("");
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      setError("Có lỗi khi thêm dịch vụ. Vui lòng thử lại!");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          padding: "20px",
          maxWidth: "500px",
          margin: "auto",
          backgroundColor: "white",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Thêm dịch vụ mới
        </Typography>
        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}
        <Stack spacing={2}>
          <TextField
            label="Tên dịch vụ"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Giá"
            variant="outlined"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
          />
          <TextField
            label="Mô tả"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
        </Stack>

        <Stack direction="row" spacing={2} style={{ marginTop: "20px" }}>
          <Button variant="outlined" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddService}>
            Thêm
          </Button>
        </Stack>
      </div>
    </Modal>
  );
};

export default ServiceAdd;
