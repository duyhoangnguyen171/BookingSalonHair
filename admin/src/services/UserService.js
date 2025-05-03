import axios from 'axios';

const API_URL = 'https://localhost:7169/api/Users';
const token = localStorage.getItem('authToken');
// Lấy token từ localStorage
const getToken = () => localStorage.getItem('token');

// Cấu hình header cho request, kèm token Authorization
const authHeader = () => {
  const token = getToken();
  if (!token) {
    console.warn('⚠️ No token found in localStorage');
  }
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
};

// Lấy danh sách người dùng
export const getUsers = () => {
  return axios.get(API_URL, authHeader()).then(res => res.data);
};

// Lấy thông tin người dùng theo ID
export const getUserById = (id) => {
  return axios.get(`${API_URL}/${id}`, authHeader()).then(res => res.data);
};

// Cập nhật người dùng
// , data
export const updateUser = (userId,data) => {

  const token = localStorage.getItem("token"); // hoặc sessionStorage tùy bạn lưu ở đâu
  return axios.post(
    `https://localhost:7169/api/Users/PutUser`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Xóa người dùng
export const deleteUser = (id) => {
  return axios.delete(`${API_URL}/${id}`, authHeader()).then(res => res.data);
};
export const addUser = (data) => {
  return axios.post("https://localhost:7169/api/Auth/register", data, authHeader())
    .then(res => res.data);
};
export const getStaff = async () => {
  try {
    const token = localStorage.getItem('authToken'); // Lấy token từ localStorage hoặc bất kỳ nơi nào bạn lưu trữ token
    const response = await axios.get('https://localhost:7169/api/Users', {
      headers: {
        'Authorization': `Bearer ${token}`, // Gửi token trong header
      },
    });
    const staffList = response.data.$values.filter(user => user.role.toLowerCase() === 'staff');
    return staffList;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhân viên:", error);
    throw error;
  }
};