using SalonBooking.API.Data;
namespace BookingSalonHair.Models
{
    public class WorkShift
    {
        public int Id { get; set; }
        public string Name { get; set; } // Ví dụ: "Ca sáng", "Ca chiều"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>(); // nên khởi tạo để tránh warning
        public  DayOfWeek DayOfWeek { get;  set; }
    }
}
