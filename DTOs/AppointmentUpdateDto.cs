using System;
using System;
using System.Collections.Generic;
using BookingSalonHair.Models;

namespace BookingSalonHair.DTOs
{
    public class AppointmentUpdateDto
    {
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; }
        public int CustomerId { get; set; }
        public int? StaffId { get; set; }
        public List<int> ServiceIds { get; set; }
        public int? WorkShiftId { get; set; }
        public string Notes { get; set; }
        public AppointmentStatus2 Status { get; set; }
    }
    public enum AppointmentStatus2
    {
        Pending,   // Đang chờ duyệt
        Confirmed, // Đã xác nhận
        Completed, // Đã hoàn thành
        Canceled   // Đã hủy
    }
}