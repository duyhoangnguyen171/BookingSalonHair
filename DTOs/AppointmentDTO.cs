using System;

namespace BookingSalonHair.DTOs
{
    public enum AppointmentStatus
    {
        Pending,   // Đang chờ duyệt
        Confirmed, // Đã xác nhận
        Completed, // Đã hoàn thành
        Canceled   // Đã hủy
    }

    public class AppointmentDTO
    {
        public int Id { get; set; }
        public int? ServiceId { get; set; }
        public int? CustomerId { get; set; } // Người đặt lịch
        public int? StaffId { get; set; }    // Nhân viên phục vụ // UserId là khách hàng, bạn có thể thay đổi theo trường hợp của mình
        public int? WorkShiftId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public string Note { get; set; }

        // Thêm trường Status để lưu trạng thái lịch hẹn
        public AppointmentStatus Status { get; set; }
    }
}
