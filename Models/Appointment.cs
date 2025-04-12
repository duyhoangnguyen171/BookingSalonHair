using System;
using BookingSalonHair.Models;

namespace BookingSalonHair.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Notes { get; set; }

        // Quan hệ đến người đặt lịch (customer)
        public int CustomerId { get; set; }
        public User Customer { get; set; }

        // Quan hệ đến nhân viên phục vụ (staff)
        public int StaffId { get; set; }
        public User Staff { get; set; }

        // Dịch vụ được chọn
        public int ServiceId { get; set; }
        public Service Service { get; set; }

        // Ca làm việc (nếu có)
        public int? WorkShiftId { get; set; }
        public WorkShift WorkShift { get; set; }
    }
}
