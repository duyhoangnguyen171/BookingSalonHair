import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, setAuthToken } from "../../services/customDataProvider";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();
    try {
      // Gửi yêu cầu đăng nhập và nhận phản hồi
      const res = await login({ email, password });
      console.log("Login response:", res);

      const  token  = res.token; // Chỉ lấy token từ phản hồi

      if (!token) {
        alert("Token không hợp lệ.");
        return;
      }

      // Decode JWT để lấy role từ token
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const role = payload["role"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // Kiểm tra quyền của người dùng (admin hoặc staff)
      if (!role || (role.toLowerCase() !== "admin" && role.toLowerCase() !== "staff")) {
        alert("Bạn không có quyền truy cập.");
        return;
      }

      // Lưu token và thiết lập trong header cho các yêu cầu sau
      localStorage.setItem("token", token);
      setAuthToken(token); // Thiết lập token cho các yêu cầu API sau này

      // Điều hướng tới trang tương ứng với vai trò
      if (role.toLowerCase() === "admin") {
        navigate("/admin"); // Điều hướng đến trang admin
      } else if (role.toLowerCase() === "staff") {
        navigate("/staff"); // Điều hướng đến trang staff
      }
    } catch (err) {
      // Xử lý lỗi nếu đăng nhập thất bại
      alert("Sai tài khoản hoặc mật khẩu.");
      console.error("Login error:", err);
    }
  };

  

  return (
    <form onSubmit={handleLogin}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Mật khẩu"
        required
      />
      <button type="submit">Đăng nhập</button>
    </form>
  );
};

export default LoginForm;
