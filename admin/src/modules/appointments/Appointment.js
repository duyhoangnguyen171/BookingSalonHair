import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppointmentService from '../../services/AppointmentService';
import ServiceService from '../../services/Serviceservice';
import * as UserService from '../../services/UserService';
import AppointmentAdd from './AppointmentAdd';
import AppointmentDetail from './AppointmentDetail';
import AppointmentEdit from './AppointmentEdit';

// Hàm giải tham chiếu vòng
const resolveReferences = (data, cache = new Map()) => {
  if (!data) {
    return [];
  }
  if (typeof data !== 'object') return data;

  if (data.$id && cache.has(data.$id)) {
    return cache.get(data.$id);
  }

  const resolved = data.$id ? { ...data } : data;
  if (data.$id) {
    cache.set(data.$id, resolved);
  }

  if (Array.isArray(data)) {
    return data.map((item) => resolveReferences(item, cache));
  }

  if (data.$values) {
    resolved.$values = resolveReferences(data.$values, cache);
    return resolved.$values;
  }

  for (const key in resolved) {
    if (key !== '$ref' && key !== '$id') {
      resolved[key] = resolveReferences(resolved[key], cache);
    }
  }

  delete resolved.$id;
  delete resolved.$ref;

  return resolved;
};

const Appointment = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  // Check query parameters for page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get('page'), 10);
    if (pageParam && pageParam >= 1 && pageParam <= totalPages) {
      console.log('Setting page from query param:', pageParam);
      setPage(pageParam);
    } else {
      setPage(1);
    }
    // Clear search term on mount
    setSearchTerm('');
  }, [location.search, totalPages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentRes, serviceRes, userRes] = await Promise.all([
          AppointmentService.getAll({ page, pageSize: rowsPerPage }),
          ServiceService.getAll(),
          UserService.getUsers(),
        ]);

        const appointmentData = appointmentRes.data.data
          ? resolveReferences(appointmentRes.data.data)
          : resolveReferences(appointmentRes.data) || [];

        setAppointments(appointmentData);
        setTotalPages(appointmentRes.data.totalPages || 1);
        setServices(serviceRes.data.$values || serviceRes.data || []);
        setCustomers(userRes.$values || userRes.data || []);
        setStaffs(userRes.$values || userRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    let filtered = [...appointments].filter((app) => app.status !== 4);

    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const customerName = app.customerFullName || '';
        return customerName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredAppointments(filtered);

    // Only auto-switch if not on explicitly selected page
    if (filtered.length === 0 && page < totalPages) {
      setPage(page + 1);
    } else if (filtered.length === 0 && page === totalPages) {
    }
  }, [searchTerm, sortOrder, appointments, page, totalPages]);

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Mới tạo',
      1: 'Chờ xác nhận',
      2: 'Đã xác nhận',
      3: 'Đã hoàn thành',
      4: 'Đã hủy',
    };
    return statusMap[status] || 'Chưa xác định';
  };

  const formatDate = (date) => {
    if (!date) return 'Ngày không xác định';
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) {
      console.error('Invalid date format:', date);
      return 'Ngày không hợp lệ';
    }
    return newDate.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleCancel = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setOpenCancelDialog(true);
  };

  const confirmCancel = () => {
    AppointmentService.cancelAppointment(selectedAppointmentId)
      .then(() => {
        // Update local state
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === selectedAppointmentId ? { ...app, status: 4 } : app
          )
        );
        // Clear search term
        setSearchTerm('');
        // Clear error state
        setError(null);
        // Refetch page 1
        AppointmentService.getAll({ page: 1, pageSize: rowsPerPage })
          .then((res) => {
            const appointmentData = res.data.data
              ? resolveReferences(res.data.data)
              : resolveReferences(res.data) || [];
            console.log('Refreshed Appointments (Cancel):', appointmentData);
            setAppointments(appointmentData);
            setTotalPages(res.data.totalPages || 1);
            setPage(1);
          })
          .catch((err) => {
            console.error('Lỗi khi làm mới danh sách sau hủy:', err);
            setError('Không thể làm mới danh sách lịch hẹn');
          });
        setOpenCancelDialog(false);
        setSelectedAppointmentId(null);
      })
      .catch((err) => {
        console.error('Lỗi khi hủy cuộc hẹn:', err);
        setError('Không thể hủy cuộc hẹn');
        setOpenCancelDialog(false);
      });
  };

  const handleCancelDialogClose = () => {
    setOpenCancelDialog(false);
    setSelectedAppointmentId(null);
  };

  const handleEdit = (appointmentId) => {
    const appointmentToEdit = appointments.find((app) => app.id === appointmentId);
    if (!appointmentToEdit) {
      console.error(`Không tìm thấy lịch hẹn với ID: ${appointmentId}`);
      alert('Lịch hẹn không tồn tại.');
      return;
    }
    setSelectedAppointment(appointmentToEdit);
    setSelectedAppointmentId(appointmentId);
    setOpenEditDialog(true);
  };

  const handleView = (appointmentId) => {
    const appointmentToView = appointments.find((app) => app.id === appointmentId);
    if (!appointmentToView) {
      console.error(`Không tìm thấy lịch hẹn với ID: ${appointmentId}`);
      alert('Lịch hẹn không tồn tại.');
      return;
    }
    setSelectedAppointment(appointmentToView);
    setOpenViewDialog(true);
  };

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedAppointment(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handlePageChange = (event, value) => {
    console.log('Manually switching to Page:', value);
    setPage(value);
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // if (!appointments.length && page === 1) {
  //   return <div>Không có lịch hẹn nào.</div>;
  // }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Danh sách cuộc hẹn</h2>
      <Stack direction="row" spacing={2} className="mb-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddClick}
          startIcon={<i className="fas fa-plus"></i>}
        >
          Thêm lịch hẹn
        </Button>
        <TextField
          label="Tìm kiếm khách hàng"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
        />
        <Button variant="contained" onClick={handleSortToggle}>
          Sắp xếp theo ngày ({sortOrder === 'asc' ? 'Tăng' : 'Giảm'})
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/admin/appointments/canceled"
        >
          Xem thùng rác
        </Button>
      </Stack>

      {filteredAppointments.length === 0 ? (
        <p>
          Không có cuộc hẹn nào trên trang này.{' '}
          {page < totalPages && (
            <Button
              variant="text"
              color="primary"
              onClick={() => setPage(page + 1)}
            >
              Xem trang tiếp theo
            </Button>
          )}
          {page === totalPages && 'Không còn lịch hẹn nào chưa hủy.'}
        </p>
      ) : (
        <>
          <table className="table table-striped">
            <thead className="thead-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Tên khách hàng</th>
                <th scope="col">Nhân viên</th>
                <th scope="col">Thời gian</th>
                <th scope="col">Dịch vụ</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app, index) => (
                <tr key={app.id}>
                  <th scope="row">{(page - 1) * rowsPerPage + index + 1}</th>
                  <td>{app.customerFullName}</td>
                  <td>{app.staffFullName}</td>
                  <td>{formatDate(app.appointmentDate)}</td>
                  <td>
                    {app.appointmentServices?.map((s) => s.serviceName).join(', ') || 'Không có dịch vụ'}
                  </td>
                  <td>{getStatusText(app.status)}</td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => handleView(app.id)}
                      >
                        Xem
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleEdit(app.id)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancel(app.id)}
                      >
                        Hủy
                      </Button>
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            className="mt-4"
            siblingCount={1}
            boundaryCount={1}
            disabled={loading}
          />
        </>
      )}

      <AppointmentAdd
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSuccess={() => {
          AppointmentService.getAll({ page: 1, pageSize: rowsPerPage })
            .then((res) => {
              const appointmentData = res.data.data
                ? resolveReferences(res.data.data)
                : resolveReferences(res.data) || [];
              console.log('Refreshed Appointments (Add):', appointmentData);
              setAppointments(appointmentData);
              setFilteredAppointments(appointmentData.filter((app) => app.status !== 4));
              setTotalPages(res.data.totalPages || 1);
              setPage(1);
              setSearchTerm('');
            })
            .catch((err) => {
              console.error('Lỗi khi làm mới danh sách lịch hẹn:', err);
              setError('Không thể làm mới danh sách lịch hẹn');
            });
          handleCloseAddDialog();
        }}
      />

      <AppointmentEdit
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSuccess={() => {
          AppointmentService.getAll({ page, pageSize: rowsPerPage })
            .then((res) => {
              const appointmentData = res.data.data
                ? resolveReferences(res.data.data)
                : resolveReferences(res.data) || [];
              console.log('Refreshed Appointments (Edit):', appointmentData);
              setAppointments(appointmentData);
              setFilteredAppointments(appointmentData.filter((app) => app.status !== 4));
              setTotalPages(res.data.totalPages || 1);
            })
            .catch((err) => {
              console.error('Lỗi khi làm mới danh sách lịch hẹn (edit):', err);
              setError('Không thể làm mới danh sách lịch hẹn');
            });
          handleCloseEditDialog();
        }}
        appointmentId={selectedAppointmentId}
        initialData={selectedAppointment}
      />

      <AppointmentDetail
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        appointment={selectedAppointment}
        customers={customers}
        staffs={staffs}
        services={services}
      />

      <Dialog open={openCancelDialog} onClose={handleCancelDialogClose}>
        <DialogTitle>Xác nhận hủy lịch hẹn</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn hủy lịch hẹn này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            Không
          </Button>
          <Button onClick={confirmCancel} color="error" autoFocus>
            Có
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Appointment;