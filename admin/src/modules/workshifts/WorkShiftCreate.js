import React, { useState } from "react";
import WorkShiftService from "../../services/WorkShiftService";
import { useNavigate } from "react-router-dom";
import "../../asset/styles/workshift/WorkShiftCreate.css";

const WorkShiftCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    shiftType: 0,     // 0 - sáng, 1 - chiều, 2 - tối
    date: "",         // ngày được chọn (để tính dayOfWeek)
    dayOfWeek: 0,     // được tính tự động từ date
    maxUsers: 1,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxUsers" ? parseInt(value) : value,
    }));
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const weekday = selectedDate.getDay(); // 0 = CN, ..., 6 = Thứ 7

    setFormData((prev) => ({
      ...prev,
      date: e.target.value,
      dayOfWeek: weekday,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || formData.name.trim() === "") {
      setError("Tên ca làm không được để trống.");
      return;
    }

    if (formData.maxUsers <= 0) {
      setError("Số lượng người tối đa phải lớn hơn 0.");
      return;
    }

    if (!formData.date) {
      setError("Vui lòng chọn ngày làm việc.");
      return;
    }

    const payload = {
      ...formData,
      shiftType: parseInt(formData.shiftType, 10),
      dayOfWeek: parseInt(formData.dayOfWeek, 10),
    };

    try {
      await WorkShiftService.create(payload);
      alert("Tạo ca làm thành công!");
      navigate("/admin/workshifts");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Bạn không có quyền thực hiện hành động này.");
      } else {
        setError("Đã xảy ra lỗi khi tạo ca làm.");
        console.error(err);
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
          <label>Loại ca:</label>
          <select name="shiftType" value={formData.shiftType} onChange={handleChange}>
            <option value={0}>Ca sáng</option>
            <option value={1}>Ca chiều</option>
            <option value={2}>Ca tối</option>
          </select>
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
            min={1}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Lưu</button>
      </form>
    </div>
  );
};

export default WorkShiftCreate;
