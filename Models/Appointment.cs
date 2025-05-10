using System;
using System.Text.Json.Serialization;
using BookingSalonHair.Models;

namespace BookingSalonHair.Models
{
    public enum AppointmentStatus
    {
        Pending = 0,
        Accepted = 1,
        InProgress = 2,
        Completed = 3,
        Canceled = 4
    }

    public class Appointment
    {
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }

        public int? CustomerId { get; set; }
        [JsonIgnore]
        public User? Customer { get; set; }

        public int? StaffId { get; set; }
        [JsonIgnore]
        public User? Staff { get; set; }

        public int? ServiceId { get; set; }
        [JsonIgnore]
        public Service? Service { get; set; }

        public int? WorkShiftId { get; set; }
        [JsonIgnore]
        public WorkShift? WorkShift { get; set; }

        public AppointmentStatus Status { get; set; }
    }

}
