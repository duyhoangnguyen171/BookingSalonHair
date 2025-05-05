import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WorkShiftService from "../../services/WorkShiftService";

// Map giá trị loại ca làm
const shiftTypeOptions = {
  0: "Ca sáng",
  1: "Ca chiều",
  2: "Ca tối",
};

// Map thứ trong tuần
const dayOfWeekOptions = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

const WorkShiftEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    shiftType: 0,
    dayOfWeek: 0,
    maxUsers: 1,
    startTime: "",
    endTime: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await WorkShiftService.getById(id);

        setFormData({
          id: data.id,
          name: data.name || "",
          shiftType: data.shiftType ?? 0,
          dayOfWeek: data.dayOfWeek ?? 0,
          maxUsers: data.maxUsers ?? 1,
          startTime: data.startTime || "",
          endTime: data.endTime || "",
        });
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu ca làm:", err);
        alert("Không thể lấy dữ liệu ca làm.");
      }
    };
    fetchData();
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxUsers" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data in the required format
    const dataToSend = {
      id: formData.id,
      shiftType: Number(formData.shiftType), // Ensure shiftType is a number
      name: formData.name,
      startTime: formData.startTime,
      endTime: formData.endTime,
      dayOfWeek: formData.dayOfWeek,
      maxUsers: formData.maxUsers,
      appointments: [], // Assuming no appointments are modified in this update
      userWorkShifts: [], // Assuming no userWorkShifts are modified in this update
    };

    console.log("Sending updated data:", dataToSend);

    try {
      // Send the structured data to the API
      const response = await WorkShiftService.update(id, dataToSend);

      // Log the response for debugging
      console.log("Response from API:", response);

      // On success, alert and navigate
      alert("Cập nhật ca làm thành công!");
      navigate("/admin/workshifts");
    } catch (err) {
      // Handle error and log the details
      console.error("Error during update:", err);
      if (err.response) {
        console.error("Error response from server:", err.response.data);
        alert(
          `Không thể cập nhật ca làm: ${
            err.response.data.message || err.response.statusText
          }`
        );
      } else {
        alert("Lỗi kết nối hoặc vấn đề khác khi cập nhật ca làm.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Chỉnh sửa ca làm</h2>
      <form onSubmit={handleSubmit}>
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
          <label>Loại ca làm:</label>
          <select
            name="shiftType"
            value={formData.shiftType}
            onChange={handleChange}
            required
          >
            {Object.entries(shiftTypeOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Thứ:</label>
          <select
            name="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={handleChange}
            required
          >
            {Object.entries(dayOfWeekOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Số người tối đa:</label>
          <input
            type="number"
            name="maxUsers"
            value={formData.maxUsers}
            onChange={handleChange}
            required
            min={1}
          />
        </div>

        <div>
          <label>Giờ bắt đầu:</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            min="00:00"
            max="23:59"
            step="3600" // chọn theo giờ, hoặc dùng "60" nếu muốn chọn từng phút
          />
        </div>

        <div>
          <label>Giờ kết thúc:</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            min="00:00"
            max="23:59"
            step="3600"
          />
        </div>

        <button type="submit">Cập nhật</button>
      </form>
    </div>
  );
};

export default WorkShiftEdit;
