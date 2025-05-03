import axios from 'axios';

// Tạo instance của axios với baseURL của API
const api = axios.create({
  baseURL: 'https://localhost:7169/api',
});

// Hàm này sẽ thiết lập token vào header Authorization
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization']; // Nếu không có token, xóa header
  }
};

// Hàm để lấy token từ localStorage (hoặc sessionStorage) nếu có
export const getToken = () => {
  return localStorage.getItem('token');  // Lấy token từ localStorage
};

// Đảm bảo rằng token được thiết lập vào header nếu có khi app load
const token = getToken();  // Lấy token từ localStorage (hoặc sessionStorage)
if (token) {
  setAuthToken(token);  // Nếu có token, thêm vào header
}

const ServiceService = {
  getAll: () => api.get("/services"),
  getById: (id) => api.get(`/services/${id}`),
  create: (serviceData) => api.post("/services", serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
};

export default ServiceService;
