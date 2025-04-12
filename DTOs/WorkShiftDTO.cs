using System;

namespace BookingSalonHair.DTOs
{
    public class WorkShiftDTO
    {
        public int Id { get; set; }
        public string StaffName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
