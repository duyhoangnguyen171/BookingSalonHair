﻿using System;
using System.Text.Json.Serialization;
using BookingSalonHair.Models;
using BookingSalonHair.DTOs;
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
        private DateTime _appointmentDate;
        public int Id { get; set; }
        public DateTime AppointmentDate
        {
            get => _appointmentDate;
            set => _appointmentDate = DateTime.SpecifyKind(value.ToUniversalTime(), DateTimeKind.Utc);
        }
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
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();
       
    }

}
