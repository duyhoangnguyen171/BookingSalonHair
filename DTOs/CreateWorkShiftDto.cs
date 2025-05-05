using BookingSalonHair.Models;

namespace BookingSalonHair.DTOs
{
    public class CreateWorkShiftDto
    {
        public string Name { get; set; } // Tên ca làm
        public ShiftType ShiftType { get; set; } // Kiểu ca làm
        public DayOfWeek DayOfWeek { get; set; } // Ngày trong tuần
        public int MaxUsers { get; set; } // Số người tối đa
    }
}
