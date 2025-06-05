import React, { useRef, useState } from "react";
import { Button, TextField, Modal, Stack, Typography } from "@mui/material";
import ServiceService from "../../services/Serviceservice";
import { uploadFile } from "../../utils/uploadfile";
import { UploadFile } from "@mui/icons-material";

const ServiceAdd = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
   const [imageurl, setImage] = useState([]);
  
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const inpRef = useRef();

  const handleAddService = async () => {
    // Kiểm tra thông tin nhập vào
    if (!name || !price || !description) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (isNaN(price) || Number(price) <= 0) {
      setError("Giá phải là một số dương!");
      return;
    }
    if (name.trim().length < 3) {
      setError("Tên dịch vụ phải có ít nhất 3 ký tự!");
      return;
    }
    if (description.trim().length < 3) {
      setError("Mô tả phải có ít nhất 3 ký tự!");
      return;
    }

    try {
      let downloadURL = "";
      if (file) {
        // Upload image
        console.log("Dữ liệu ảnh gửi đi:", {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          fileType: file.type,
        });
        downloadURL = await uploadFile(file, "images");
        console.log("URL ảnh sau khi tải lên:", downloadURL);
        if (typeof downloadURL !== "string" || downloadURL === "Error upload") {
          throw new Error("Tải ảnh lên thất bại, không nhận được URL hợp lệ.");
        }
      }

      const serviceData = {
        
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          imageurl: downloadURL ? [downloadURL] : [],
      };

      // Log the payload being sent to the API
      console.log("Dữ liệu dịch vụ gửi đi:", serviceData);

      await ServiceService.create(serviceData);
      onSuccess();
      setName("");

      setPrice("");
      setDescription("");
      setImage([]);
      setFile(null);
      inpRef.current.value = "";
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      // Log the full error response for debugging
      console.log(
        "Chi tiết lỗi từ server:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.log("Toàn bộ lỗi:", JSON.stringify(error, null, 2));
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
          marginTop: "50px",
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
          <label>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              component="span"
              startIcon={<UploadFile />}
              onClick={() => inpRef.current.click()}
            >
              Thêm ảnh
            </Button>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={inpRef}
              onChange={(e) => setFile(e.target.files[0])}
              hidden
            />
          </label>
          {file && (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "200px" }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={2} style={{ marginTop: "20px" }}>
          <Button variant="outlined" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddService}
          >
            Thêm
          </Button>
        </Stack>
      </div>
    </Modal>
  );
};

export default ServiceAdd;
