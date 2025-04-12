using SalonBooking.API.Data;
using BookingSalonHair.Interfaces;
using BookingSalonHair.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BookingSalonHair.Service;

var builder = WebApplication.CreateBuilder(args);

// ✅ 1. Add DbContext
builder.Services.AddDbContext<SalonContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ 2. Add Authentication
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options => {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,
//            ValidIssuer = builder.Configuration["Jwt:Issuer"],
//            ValidAudience = builder.Configuration["Jwt:Audience"],
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
//        };
//    });
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,                    // Kiểm tra Issuer có hợp lệ không
            ValidateAudience = true,                  // Kiểm tra Audience có hợp lệ không
            ValidateLifetime = true,                  // Kiểm tra token có hết hạn không
            ValidateIssuerSigningKey = true,          // Kiểm tra key ký có hợp lệ không
            ValidIssuer = builder.Configuration["Jwt:Issuer"],   // Cấu hình Issuer
            ValidAudience = builder.Configuration["Jwt:Audience"], // Cấu hình Audience
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])), // Key bí mật
            //RoleClaimType = "role"
        };

        // Lọc lỗi nếu token không hợp lệ hoặc không xác thực được
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("Token authentication failed: " + context.Exception.Message);
                return Task.CompletedTask;
            },
            OnForbidden = context =>
            {
                Console.WriteLine("Access forbidden: " + context.Request.Path);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ✅ 3. Register Services (DI)
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IWorkShiftService, WorkShiftService>();
builder.Services.AddScoped<IContactService, ContactService>();

// ✅ 4. Swagger & Controller
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Booking Salon Hair API",
        Version = "v1"
    });

    // 🔐 Thêm hỗ trợ JWT Bearer vào Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập token vào đây: Bearer {your token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// ✅ 5. Configure Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();  // ✅ PHẢI ĐẶT TRƯỚC UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
