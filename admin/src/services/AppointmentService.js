import axios from 'axios';

// Tạo instance của axios với baseURL của API
const api = axios.create({
  baseURL: 'https://localhost:7169/api',  // URL của API
});

// Hàm này sẽ thiết lập token vào header Authorization
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];  // Nếu không có token, xóa header
  }
};

// Hàm để lấy token từ localStorage (hoặc sessionStorage) nếu có
export const getToken = () => {
  return localStorage.getItem('token');
};

// Đảm bảo rằng token được thiết lập vào header nếu có khi app load
const token = getToken();  // Lấy token từ localStorage (hoặc sessionStorage)
if (token) {
  setAuthToken(token);  // Nếu có token, thêm vào header
}
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
// AppointmentService.js
const AppointmentService = {
  getAll: () => api.get("/appointments",getAuthHeader()),  // Gửi yêu cầu đến /appointments với token trong header
  getByUserId: (userId) => api.get(`/appointments/user/${userId}`),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post("/appointments", appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export default AppointmentService;
