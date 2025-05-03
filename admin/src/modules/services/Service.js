import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Modal,
} from "@mui/material";
import ServiceService from "../../services/Serviceservice";
import ServiceAdd from "./ServiceAdd";
import ServiceEdit from "./ServiceEdit";

const Services = () => {
  const [services, setServices] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const loadServices = async () => {
    try {
      const response = await ServiceService.getAll();
      const data = response.data;
      if (data && Array.isArray(data.$values)) {
        setServices(data.$values);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error);
      setServices([]);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  const handleEdit = (id) => {
    setSelectedServiceId(id);
    setOpenEdit(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) {
      try {
        await ServiceService.delete(id);
        alert("Dịch vụ đã bị xóa thành công!");
        loadServices();
      } catch (error) {
        console.error("Lỗi khi xoá dịch vụ:", error);
        alert("Có lỗi khi xóa dịch vụ. Vui lòng thử lại!");
      }
    }
  };

  const handleView = (service) => {
    setSelectedService(service);
    setOpenView(true);
  };

  const handleCloseView = () => setOpenView(false);

  return (
    <div>
      <h1>Dịch vụ</h1>
      <div className="button-container">
        <Button
          className="add-button"
          variant="contained"
          color="primary"
          onClick={handleAdd}
        >
          Thêm dịch vụ
        </Button>
      </div>
      <ServiceAdd
        open={openAdd}
        onClose={handleCloseAdd}
        onSuccess={() => {
          loadServices(); // Cập nhật danh sách dịch vụ sau khi thêm mới
          handleCloseAdd();
        }}
      />

      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên dịch vụ</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Chi tiết</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.id}</TableCell>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.price}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} className="actions">
                      <Button
                        size="small"
                        onClick={() => handleView(service)}
                        variant="outlined"
                        color="info"
                      >
                        Xem
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleEdit(service.id)}
                        variant="outlined"
                        color="warning"
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDelete(service.id)}
                        variant="outlined"
                        color="error"
                      >
                        Xoá
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có dịch vụ nào để hiển thị.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal chỉnh sửa dịch vụ */}
      <ServiceEdit
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        serviceId={selectedServiceId}
        onSuccess={() => {
          loadServices();
          setOpenEdit(false);
        }}
      />

      {/* Modal xem chi tiết */}
      <Modal open={openView} onClose={handleCloseView}>
        <div
          style={{
            padding: "20px",
            maxWidth: "500px",
            margin: "auto",
            backgroundColor: "white",
          }}
        >
          <h3>Chi tiết dịch vụ</h3>
          {selectedService && (
            <>
              <p>
                <strong>Tên:</strong> {selectedService.name}
              </p>
              <p>
                <strong>Giá:</strong> {selectedService.price}
              </p>
              <p>
                <strong>Thời gian:</strong> {selectedService.durationMinutes} phút
              </p>
              <Button variant="outlined" onClick={handleCloseView}>
                Đóng
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Services;
