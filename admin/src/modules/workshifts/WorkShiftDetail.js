import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WorkShiftService from "../../services/WorkShiftService";

const WorkShiftDetail = () => {
    const { shiftId } = useParams();
    const [data, setData] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await WorkShiftService.getById(shiftId);
          console.log('API trả về:', result);
          setData(result);
          setError(null);
        } catch (error) {
          console.error("Không thể tải dữ liệu ca làm:", error);
          setError("Không thể tải dữ liệu ca làm.");
        }
      };
  
      if (shiftId) {
        fetchData();
      }
    }, [shiftId]);
  
    const assignStaff = async (appointmentId, staffId) => {
      if (!staffId) return;
      setAssigning(true);
      try {
        await WorkShiftService.assignStaff(shiftId, appointmentId, staffId);
        setError(null);
        alert("Gán thành công");
        const updated = await WorkShiftService.getById(shiftId);
        setData(updated);
      } catch (err) {
        setError("Lỗi khi gán nhân viên.");
      } finally {
        setAssigning(false);
      }
    };
  
    if (!data) return <div>Đang tải dữ liệu...</div>;
  
    const appointments = data.appointments?.$values ?? [];
    const registeredStaffs = data.registeredStaffs?.$values ?? [];
  return (
    <div style={{ display: "flex", gap: "40px" }}>
      {/* Danh sách lịch hẹn */}
      <div style={{ flex: 1 }}>
        <h3>Danh sách lịch hẹn</h3>
        {appointments.length === 0 ? (
          <p>Chưa có lịch nào</p>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              style={{
                border: "1px solid gray",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <p><strong>Khách:</strong> {appt.customerName || "Chưa có"}</p>
              <p><strong>Nhân viên:</strong> {appt.staffName || "Chưa gán"}</p>
              <label>Chọn nhân viên khác:</label>
              <select
                onChange={(e) => assignStaff(appt.id, parseInt(e.target.value))}
                disabled={assigning}
                defaultValue=""
              >
                <option value="" disabled>-- Chọn nhân viên --</option>
                {registeredStaffs.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
  
      {/* Nhân viên đã đăng ký */}
      <div style={{ flex: 1 }}>
        <h3>Nhân viên đã đăng ký</h3>
        {registeredStaffs.length === 0 ? (
          <p>Chưa có nhân viên đăng ký</p>
        ) : (
          <ul>
            {registeredStaffs.map((s) => (
              <li key={s.id}>{s.fullName}</li>
            ))}
          </ul>
        )}
      </div>
  
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && <div className="error">{error}</div>}
    </div>
  );
  
};

export default WorkShiftDetail;
