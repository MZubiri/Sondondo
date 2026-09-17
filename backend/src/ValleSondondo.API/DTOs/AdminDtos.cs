using System.ComponentModel.DataAnnotations;

namespace ValleSondondo.API.DTOs;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo o usuario es obligatorio.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Administrator";
    public DateTime ExpiresAt { get; set; }
}

public class BookingAdminDto
{
    public int Id { get; set; }
    public int? TourId { get; set; }
    public string TourTitle { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int NumberOfPeople { get; set; }
    public DateTime? TravelDate { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public string WhatsAppDirectUrl { get; set; } = string.Empty;
}

public class UpdateBookingStatusDto
{
    [Required]
    public string Status { get; set; } = "Pending";
}

public class CreateTourDto
{
    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;

    [StringLength(150)]
    public string? Slug { get; set; }

    [StringLength(250)]
    public string Subtitle { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public string Duration { get; set; } = string.Empty;
    public int DurationDays { get; set; } = 1;

    public decimal PriceSoles { get; set; }
    public decimal PriceUsd { get; set; }

    public string Difficulty { get; set; } = "Moderada";
    public string AltitudeMax { get; set; } = "3,500 msnm";
    public string StartingPoint { get; set; } = "Aucará / Puquio";
    public bool Featured { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public string MainImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;

    public List<string> GalleryImages { get; set; } = new();
    public List<string> Included { get; set; } = new();
    public List<string> NotIncluded { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class UpdateTourDto : CreateTourDto
{
    public int Id { get; set; }
}

public class DashboardStatsDto
{
    public int TotalBookings { get; set; }
    public int PendingBookings { get; set; }
    public int ConfirmedBookings { get; set; }
    public int ActiveTours { get; set; }
    public int TotalTours { get; set; }
    public int UnreadMessages { get; set; }
    public List<BookingAdminDto> RecentBookings { get; set; } = new();
}

public class ContactMessageAdminDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
