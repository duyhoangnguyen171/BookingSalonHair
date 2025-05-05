namespace BookingSalonHair.Models
{
    public class WorkShift
    {
        public int Id { get; set; }
        public ShiftType ShiftType { get; set; }
        public string Name { get; set; } // Ví dụ: "Ca sáng", "Ca chiều"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>(); // Khởi tạo để tránh warning
        public DayOfWeek DayOfWeek { get; set; }
        public int MaxUsers { get; set; } // Giới hạn số lượng người đăng ký
        public ICollection<UserWorkShift> UserWorkShifts { get; set; }
    }
    public enum ShiftType
    {
        Morning,
        Afternoon,
        Evening
    }
}

