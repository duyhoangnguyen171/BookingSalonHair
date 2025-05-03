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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserAdd from "./UserAdd";
import UserEdit from "./UserEdit";
import { deleteUser, getUsers } from "../../services/UserService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openViewUser, setOpenViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      console.log("Fetched Users:", data);
      if (data && Array.isArray(data.$values)) {
        setUsers(data.$values);
      } else {
        setUsers([]); // Handle case if data is not an array
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Fallback to empty array on error
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

  return (
    <div>
      <h1>Người dùng</h1>
      <Button variant="contained" color="primary" onClick={handleOpenAddUser}>
        Thêm người dùng
      </Button>

      <UserAdd
        open={openAddUser}
        onClose={handleCloseAddUser}
        onSuccess={() => {
          loadUsers();
          handleCloseAddUser();
        }}
      />

      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.phone}</TableCell>
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
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", backgroundColor: "white" }}>
          <h3>Chi tiết người dùng</h3>
          {selectedUser && (
            <>
              <p><strong>Họ tên:</strong> {selectedUser.fullName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Vai trò:</strong> {selectedUser.role}</p>
              <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
              <Button variant="outlined" onClick={handleCloseViewUser}>Đóng</Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Users;
