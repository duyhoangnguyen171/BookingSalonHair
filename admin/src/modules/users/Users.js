import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Modal,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserAdd from "./UserAdd";
import UserEdit from "./UserEdit";
import { deleteUser, getUsers } from "../../services/UserService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openViewUser, setOpenViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7; // Maximum 10 users per page

  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      console.log("Fetched Users:", data);
      if (data && Array.isArray(data.$values)) {
        setUsers(data.$values);
        setFilteredUsers(data.$values);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on role and search query
  useEffect(() => {
    let filtered = [...users];

    // Filter by role
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          (user.fullName &&
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.phone && user.phone.includes(searchQuery))
      );
    }

    setFilteredUsers(filtered);
    setPage(1); // Reset to page 1 when filter or search changes
  }, [filterRole, searchQuery, users]);

  const handleOpenAddUser = () => {
    setOpenAddUser(true);
  };

  const handleCloseAddUser = () => {
    setOpenAddUser(false);
  };

  const handleEdit = (id) => {
    setSelectedUserId(id);
    setOpenEditUser(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenViewUser(true);
  };

  const handleCloseViewUser = () => {
    setOpenViewUser(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteUser(id);
        alert("Người dùng đã bị xóa thành công!");
        loadUsers();
      } catch (error) {
        console.error("Lỗi khi xoá người dùng:", error);
        alert("Có lỗi khi xóa người dùng. Vui lòng thử lại!");
      }
    }
  };

  // Display account type
  const getAccountType = (isGuest) => {
    return isGuest ? "Khách vãng lai" : "Thành viên";
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate pagination
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  return (
    <div>
      <h1>Người dùng</h1>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        style={{ marginBottom: "20px" }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddUser}
        >
          Thêm người dùng
        </Button>
        <FormControl style={{ minWidth: 150 }}>
          <InputLabel>Lọc theo vai trò</InputLabel>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            label="Lọc theo vai trò"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Tìm kiếm theo tên hoặc số điện thoại"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ minWidth: 250 }}
        />
      </Stack>

      <UserAdd
        open={openAddUser}
        onClose={handleCloseAddUser}
        onSuccess={() => {
          loadUsers();
          handleCloseAddUser();
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Loại tài khoản</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(paginatedUsers) &&
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Typography color={user.isGuest ? "error" : "primary"}>
                      {getAccountType(user.isGuest)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => handleViewUser(user)}
                      >
                        Xem
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleEdit(user.id)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user.id)}
                      >
                        Xoá
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length > 0 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          className="mt-4"
          siblingCount={1}
          boundaryCount={1}
        />
      )}

      <UserEdit
        open={openEditUser}
        onClose={() => setOpenEditUser(false)}
        userId={selectedUserId}
        onSuccess={() => {
          loadUsers();
          setOpenEditUser(false);
        }}
      />

      <Modal open={openViewUser} onClose={handleCloseViewUser}>
        <div
          style={{
            padding: "20px",
            maxWidth: "500px",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
            marginTop: "50px",
          }}
        >
          <h3>Chi tiết người dùng</h3>
          {selectedUser && (
            <>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Họ tên:</strong> {selectedUser.fullName}</p>
              <p><strong>Email:</strong> {selectedUser.email || "N/A"}</p>
              <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role}</p>
              <p>
                <strong>Loại tài khoản:</strong>{" "}
                <Typography
                  component="span"
                  color={selectedUser.isGuest ? "error" : "primary"}
                >
                  {getAccountType(selectedUser.isGuest)}
                </Typography>
              </p>
              {selectedUser.isGuest && (
                <Typography color="textSecondary" variant="body2">
                  Lưu ý: Đây là khách vãng lai, không có email hoặc mật khẩu.
                </Typography>
              )}
              <Button
                variant="outlined"
                onClick={handleCloseViewUser}
                style={{ marginTop: "10px" }}
              >
                Đóng
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Users;