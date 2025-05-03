import cattoc from "../images/cattoc.jpg";
import phuchoi from "../images/phuchoi.png";
import uontoc from "../images/uontoc.png";
import noitoc from "../images/noitoc.png";
import nhomtoc1 from "../images/nhomtoc1.jpg";
import goidau from "../images/goidau.jpg";

//CUSTOMERS
export const staffs = [
  {
    _id: 1,
    name: "Thanh Hằng",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    email: "sarah.johnson@example.com",
    phone: "123-456-7890",
    gender: "Female",
    joinDate: "2023-01-15",
    position: "Nhà tạo mẫu cao cấp",
  },
  {
    _id: 2,
    name: "Tuấn Vũ",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    email: "michael.brown@example.com",
    phone: "987-654-3210",
    gender: "Male",
    joinDate: "2023-02-10",
    position: "Chuyên gia màu sắc",
  },
  {
    _id: 3,
    name: "Na Na",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    email: "emily.davis@example.com",
    phone: "456-789-1234",
    gender: "Female",
    joinDate: "2023-03-05",
    position: "Chuyên gia điều trị tóc",
  },
  {
    _id: 4,
    name: "Quốc Phòng",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    email: "john.smith@example.com",
    phone: "321-654-9870",
    gender: "Male",
    joinDate: "2023-04-20",
    position: "Nhà tạo mẫu trẻ",
  },
  {
    _id: 5,
    name: "Thị Trắng",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    email: "anna.white@example.com",
    phone: "654-321-0987",
    gender: "Female",
    position: "Giám đốc dịch vụ khách hàng",
    joinDate: "2023-04-05",
  },
  {
    _id: 6,
    name: "Trung Hùng",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    email: "james.wilson@example.com",
    phone: "987-654-3210",
    gender: "Male",
    position: "Quản lý Salon",
    joinDate: "2023-01-05",
  },
];

export const customers = [
  {
    _id: "cus1",
    name: "Thu Hằng",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    email: "sarah.johnson@example.com",
    phone: "123-456-7890",
    gender: "Female",
  },
  {
    _id: "cus2",
    name: "Michael Brown",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    email: "michael.brown@example.com",
    phone: "987-654-3210",
    gender: "Male",
  },
  {
    _id: "cus3",
    name: "Emily Davis",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    email: "emily.davis@example.com",
    phone: "456-789-1234",
    gender: "Female",
  },
  {
    _id: "cus4",
    name: "John Smith",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    email: "john.smith@example.com",
    phone: "321-654-9870",
    gender: "Male",
  },
];

export const reviews = [
  {
    id: 1,
    user_name: "Nguyễn Văn Thành",
    comment: "thợ cắt tóc rất đẹp, rất nhiệt tình",
    service_id: 11,
  },
  {
    id: 2,
    user_name: "Chu Thị Hương",
    comment: "thợ cắt tóc rất đẹp, rất nhiệt tình",
    service_id: 2,
  },
  {
    id: 3,
    user_name: "Đàng Thị Diễm",
    comment: "thợ cắt tóc rất đẹp, rất nhiệt tình",
    service_id: 3,
  },
  {
    id: 4,
    user_name: "Kim Ngân",
    comment: "thợ cắt tóc rất đẹp, rất nhiệt tình",
    service_id: 4,
  },
];
//SERVICE
export const services = [
  {
    _id: "ser1",
    name: "Cắt tóc",
    description: "Cắt tóc chính xác được điều chỉnh theo phong cách của bạn.",
    price: 50000,
    duration: "30 minutes",
    image: cattoc,
  },
  {
    _id: "ser2",
    name: "Nối tóc",
    description: "Professional hair coloring with premium products.",
    price: 120000,
    duration: "1 giờ",
    image: noitoc,
  },
  {
    _id: "ser3",
    name: "Gội đầu",
    description: "Deep conditioning and scalp treatment.",
    price: 50000,
    duration: "45 phút",
    image: goidau,
  },
  {
    _id: "ser4",
    name: "Uốn tóc",
    description: "Blow dry and styling for any occasion.",
    price: 300000,
    duration: "30 phút",
    image: uontoc,
  },
  {
    _id: "ser5",
    name: "Phục hồi",
    description: "Blow dry and styling for any occasion.",
    price: 300000,
    duration: "30 phút",
    image: phuchoi,
  },
  {
    _id: "ser6",
    name: "Nhộm tóc",
    description: "Nhuộm tóc chuyên nghiệp với các sản phẩm cao cấp",
    price: 300000,
    duration: "30 phút",
    image: nhomtoc1,
  },
];

//APPOINTMENT
export const appointments = [
  {
    id: 1,
    customerId: "cus1",
    staffName: "Thanh Hằng",
    serviceName: "Cắt tóc",
    date: "2025-03-26",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    id: 2,
    customerId: "cus1",
    staffName: "Thanh Hằng",
    serviceName: "Cắt tóc",
    date: "2025-03-27",
    time: "2:00 PM",
    status: "Pending",
  },
  {
    id: 3,
    customerId: "cus1",
    staffName: "Thanh Hằng",
    serviceName: "Cắt tóc",
    date: "2025-03-28",
    time: "11:00 AM",
    status: "Cancelled",
  },
  {
    id: 4,
    customerId: "cus2",
    staffName: "Thanh Hằng",
    serviceName: "Cắt tóc",
    date: "2025-03-29",
    time: "3:00 PM",
    status: "Confirmed",
  },
];
