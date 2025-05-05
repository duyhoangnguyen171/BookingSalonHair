using SalonBooking.API.Data;
namespace BookingSalonHair.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
       
        public ICollection<Appointment>? Appointments { get; set; }
        public string Description { get; set; }
    }
}
