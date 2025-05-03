import axios from "axios";

const API_URL = "https://localhost:7169/api/WorkShifts";

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // đảm bảo bạn lưu token khi login
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const WorkShiftService = {
  getAll: () => axios.get(API_URL, getAuthHeader()).then(res => res.data),
  getByStaffId: (id) =>
    axios.get(`${API_URL}/staff/${id}`, getAuthHeader()).then(res => res.data),
  create: (data) => axios.post(API_URL, data, getAuthHeader()),
  delete: (id) => axios.delete(`${API_URL}/${id}`, getAuthHeader()),
  getBookedByStaffId: (staffId) =>
    axios
      .get(`https://localhost:7169/api/Users/bookedByStaff/${staffId}`, getAuthHeader())
      .then((res) => res.data),
};

export default WorkShiftService;
