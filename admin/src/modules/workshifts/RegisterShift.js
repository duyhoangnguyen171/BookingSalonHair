import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegisterShift = ({ staffId }) => {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [message, setMessage] = useState('');

  // Lấy danh sách ca làm từ API
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await axios.get('/api/WorkShift/GetAvailableShifts'); // Giả sử bạn có API để lấy danh sách ca làm
        setShifts(response.data);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy danh sách ca làm", error);
      }
    };

    fetchShifts();
  }, []);

  // Xử lý đăng ký ca làm
  const handleRegisterShift = async (e) => {
    e.preventDefault();

    if (!selectedShift) {
      setMessage('Vui lòng chọn một ca làm.');
      return;
    }

    try {
      const response = await axios.post('/api/WorkShift/Register', null, {
        params: {
          shiftId: selectedShift,
          staffId: staffId,
        },
      });

      setMessage(response.data);
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi đăng ký ca làm.');
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Đăng ký ca làm</h3>
      <form onSubmit={handleRegisterShift}>
        <div>
          <label htmlFor="shift">Chọn ca làm: </label>
          <select
            id="shift"
            onChange={(e) => setSelectedShift(Number(e.target.value))}
            value={selectedShift || ''}
          >
            <option value="" disabled>Chọn ca làm</option>
            {shifts.map(shift => (
              <option key={shift.id} value={shift.id}>
                {shift.name} - {shift.startTime} đến {shift.endTime}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button type="submit">Đăng ký</button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterShift;
