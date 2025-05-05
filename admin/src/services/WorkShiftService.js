// src/services/WorkShiftService.js

import axios from "axios";

const API_URL = "https://localhost:7169/api/WorkShifts";

// Hàm lấy token và trả về header Authorization
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const WorkShiftService = {
  // Lấy tất cả ca làm
  getAll: async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ca làm:", error);
      throw error;
    }
  },
  // lấy dữ liệu từ phần tử thông qua id
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy ca làm với id ${id}:`, error);
      throw error;
    }
  },
  // Đăng ký ca làm 
  registerShift: async (userId, shiftId) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        staffId: userId,
        shiftId: shiftId,
      });
      return response.data;
    } catch (error) {
      console.error("Error registering shift:", error);
      throw error;
    }
  },
  // Lấy ca làm theo staffId
  getByStaffId: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/staff/${staffId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy ca làm cho staffId ${staffId}:`, error);
      throw error;
    }
  },

  // Tạo ca làm mới
  create: async (data) => {
    try {
      console.log("Dữ liệu gửi đi:", data);
      await axios.post(`${API_URL}/by-type`, data, getAuthHeader());
    } catch (error) {
      console.error("Lỗi khi tạo ca làm mới:", error);
      throw error;
    }
  },

  // Xóa ca làm
  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    } catch (error) {
      console.error(`Lỗi khi xóa ca làm với id ${id}:`, error);
      throw error;
    }
  },
  update: async (id, data) => {
    console.log(" data:", data);

    try {
      await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    } catch (error) {
      console.error(`Lỗi khi cập nhật ca làm với id ${id}:`, error);
      throw error;
    }
  },

  // Lấy các ca đã được nhân viên đặt
  getBookedByStaffId: async (staffId) => {
    try {
      const response = await axios.get(`https://localhost:7169/api/Users/bookedByStaff/${staffId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy các ca đã đặt cho staffId ${staffId}:`, error);
      throw error;
    }
  },
};


export default WorkShiftService;
