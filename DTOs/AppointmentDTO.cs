using System;

namespace BookingSalonHair.DTOs
{
    public class AppointmentDTO
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public int UserId { get; set; }
        public int? WorkShiftId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public string Note { get; set; }
    }
}
