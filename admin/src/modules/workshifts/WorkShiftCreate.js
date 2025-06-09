import React, { useState } from "react";
import WorkShiftService from "../../services/WorkShiftService";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../asset/styles/workshift/WorkShiftCreate.css";

const WorkShiftCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    date: "", // ngày được chọn (để tính dayOfWeek)
    dayOfWeek: 0, // được tính tự động từ date
    startTime: "08:00", // Thời gian bắt đầu (default 8:00 AM)
    endTime: "22:00", // Thời gian kết thúc (default 10:00 PM)
    maxUsers: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxUsers" ? parseInt(value) : value,
    }));
  };

  const handleDateChange = (e) => {
  const selectedDate = new Date(e.target.value);
  const weekday = selectedDate.getDay(); // 0 = Chủ Nhật, ..., 6 = Thứ Bảy

  setFormData((prev) => ({
    ...prev,
    date: e.target.value,
    dayOfWeek: weekday,  // Cập nhật dayOfWeek từ ngày chọn
  }));
};
  const handleSave = async (e) => {
    e.preventDefault();

    console.log("Submitting form with payload:", formData);

    if (!formData.name || formData.name.trim() === "") {
      console.log("Validation error: Empty shift name");
      toast.error("Tên ca làm không được để trống.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    if (formData.maxUsers <= 0) {
      console.log("Validation error: Invalid maxUsers");
      toast.error("Số lượng người tối đa phải lớn hơn 0.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    if (!formData.date) {
      console.log("Validation error: No date selected");
      toast.error("Vui lòng chọn ngày làm việc.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    const payload = {
      ...formData,
      dayOfWeek: parseInt(formData.dayOfWeek, 10),
    };

    try {
      console.log("Sending API request with payload:", payload);
      await WorkShiftService.create(payload);
      console.log("Shift created successfully");
      toast.success("Tạo ca làm thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      // setTimeout(() => navigate("/admin/workshifts"), 3500);
    } catch (err) {
      console.error("Error creating shift:", err);
      if (err.response?.status === 401) {
        console.log("Unauthorized error (401)");
        toast.error("Bạn không có quyền thực hiện hành động này.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      } else {
        console.log("General error:", err.message);
        toast.error("Đã xảy ra lỗi khi tạo ca làm.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Tạo Ca Làm</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Tên ca làm:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Chọn ngày:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            required
          />
        </div>

        <div>
          <label>Số lượng người tối đa:</label>
          <input
            type="number"
            name="maxUsers"
            value={formData.maxUsers}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Giờ bắt đầu:</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Giờ kết thúc:</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Lưu</button>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default WorkShiftCreate;
