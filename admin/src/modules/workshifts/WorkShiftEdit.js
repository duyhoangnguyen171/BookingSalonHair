import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WorkShiftService from "../../services/WorkShiftService";
import "../../asset/styles/workshift/WorkShiftCreate.css";

const WorkShiftEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the work shift ID from URL parameters

  const [formData, setFormData] = useState({
    name: "",
    shiftType: 0, // 0 - sáng, 1 - chiều, 2 - tối
    date: "", // ngày được chọn (để tính dayOfWeek)
    dayOfWeek: 0, // được tính tự động từ date
    maxUsers: 1,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch work shift data when component mounts
  useEffect(() => {
    const fetchWorkShift = async () => {
      try {
        const response = await WorkShiftService.getById(id);
        const shift = response; // Assuming response is the work shift object

        // Calculate a date based on dayOfWeek
        const today = new Date();
        const currentDay = today.getDay();
        const diff = shift.dayOfWeek - currentDay;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);

        // Format date for input (YYYY-MM-DD)
        const formattedDate = targetDate.toISOString().split("T")[0];

        setFormData({
          name: shift.name || "",
          shiftType: shift.shiftType || 0,
          date: formattedDate,
          dayOfWeek: shift.dayOfWeek || 0,
          maxUsers: shift.maxUsers || 1,
        });
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin ca làm.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchWorkShift();
  }, [id]);

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
      id: parseInt(id),
      name: formData.name,
      shiftType: parseInt(formData.shiftType, 10),
      dayOfWeek: parseInt(formData.dayOfWeek, 10),
      maxUsers: formData.maxUsers,
    };

    try {
      await WorkShiftService.update(payload);
      alert("Cập nhật ca làm thành công!");
      navigate("/admin/workshifts");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Bạn không có quyền thực hiện hành động này.");
      } else if (err.response?.status === 404) {
        setError("Ca làm không tồn tại.");
      } else {
        setError("Đã xảy ra lỗi khi cập nhật ca làm.");
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Đang tải thông tin ca làm...</div>;
  }

  if (error && !formData.name) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Chỉnh Sửa Ca Làm</h2>
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

export default WorkShiftEdit;