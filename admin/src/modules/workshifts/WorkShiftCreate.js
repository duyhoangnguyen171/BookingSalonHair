import React, { useState } from "react";
import WorkShiftService from "../../services/WorkShiftService";
import { useNavigate } from "react-router-dom";
import "../../asset/styles/workshift/WorkShiftCreate.css";
const WorkShiftCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    shiftType: 0, // 0 - sáng, 1 - chiều, 2 - tối
    dayOfWeek: 0, // 0 - Chủ nhật, 1 - Thứ 2, ..., 6 - Thứ 7
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

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
  
    // Kiểm tra dữ liệu
    if (!formData.name || formData.name.trim() === "") {
      setError("Tên ca làm không được để trống.");
      return;
    }
  
    if (formData.maxUsers <= 0) {
      setError("Số lượng người tối đa phải lớn hơn 0.");
      return;
    }
  
    // Chuyển shiftType và dayOfWeek sang số
    const payload = {
      ...formData,
      shiftType: parseInt(formData.shiftType, 10), // Chuyển shiftType thành số
      dayOfWeek: parseInt(formData.dayOfWeek, 10), // Chuyển dayOfWeek thành số
    };
  
    try {
      await WorkShiftService.create(payload);
      alert("Tạo ca làm thành công!");
      navigate("/admin/workshifts"); // Điều hướng về danh sách ca làm
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập bằng tài khoản admin.");
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
          <label>Thứ trong tuần:</label>
          <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
            <option value={0}>Chủ nhật</option>
            <option value={1}>Thứ 2</option>
            <option value={2}>Thứ 3</option>
            <option value={3}>Thứ 4</option>
            <option value={4}>Thứ 5</option>
            <option value={5}>Thứ 6</option>
            <option value={6}>Thứ 7</option>
          </select>
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
