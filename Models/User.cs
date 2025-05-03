using SalonBooking.API.Data;
using System.Text.Json.Serialization;
namespace BookingSalonHair.Models
{
    //public class User
    //{
    //    public int Id { get; set; }
    //    public string FullName { get; set; }
    //    public string Email { get; set; }
    //    public string PasswordHash { get; set; }
    //    public string Phone { get; set; }
    //    private string role;
    //    public string Role { get; set; }
    //    public string Role
    //    {
    //        get
    //        {
    //            return role.ToLower();
    //        }
    //        set
    //        {
    //            role = value;
    //        }
    //    } // "Admin", "Staff", "Customer"

    //    public ICollection<Contact> Contacts { get; set; }  
    //    public ICollection<Appointment> Appointments { get; set; } 
    //    public ICollection<Gallery> Galleries { get; set; }
    //}
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; }

        // Đánh dấu [JsonIgnore] để ngừng serialize Contacts trong User
        [JsonIgnore]
        public ICollection<Contact> Contacts { get; set; } = null;

        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<Gallery> Galleries { get; set; }
    }
}
