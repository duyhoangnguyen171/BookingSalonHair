using BookingSalonHair.DTOs;
using BookingSalonHair.Models;
using Microsoft.EntityFrameworkCore;
//using SalonBooking.API.Models;

namespace SalonBooking.API.Data
{
    public class SalonContext : DbContext
    {
        public SalonContext(DbContextOptions<SalonContext> options) : base(options) { }

        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Gallery> Galleries { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserDTO> User { get; set; }

        public DbSet<WorkShift> WorkShifts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Appointment - Customer
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Customer)
                .WithMany()
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Restrict); // tránh vòng lặp xóa

            // Appointment - Staff
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Staff)
                .WithMany()
                .HasForeignKey(a => a.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            // Service - Appointment (1 - nhiều)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Service)
                .WithMany(s => s.Appointments)
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // WorkShift - Appointment (1 - nhiều)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.WorkShift)
                .WithMany(w => w.Appointments)
                .HasForeignKey(a => a.WorkShiftId)
                .OnDelete(DeleteBehavior.SetNull);

            // User - Contact (1 - nhiều)
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.User)
                .WithMany(u => u.Contacts)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User - Gallery (1 - nhiều)
            modelBuilder.Entity<Gallery>()
                .HasOne(g => g.User)
                .WithMany(u => u.Galleries)
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: Email của User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Required và độ dài
            modelBuilder.Entity<User>()
                .Property(u => u.FullName)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Service>()
                    .Property(s => s.Name)
                    .IsRequired()
                    .HasMaxLength(100);

            // Cấu hình cho Service.Price
            modelBuilder.Entity<Service>()
                .Property(s => s.Price)
                .HasPrecision(18, 2); // hoặc 10, 2 tùy theo yêu cầu của bạn
        }

    }
}

