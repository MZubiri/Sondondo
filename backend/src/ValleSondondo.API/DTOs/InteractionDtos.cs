using System.ComponentModel.DataAnnotations;

namespace ValleSondondo.API.DTOs;

public class CreateBookingInquiryDto
{
    public int? TourId { get; set; }

    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono o WhatsApp es obligatorio.")]
    [StringLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Range(1, 100, ErrorMessage = "El número de personas debe ser al menos 1.")]
    public int NumberOfPeople { get; set; } = 1;

    public DateTime? TravelDate { get; set; }

    [StringLength(1000)]
    public string Message { get; set; } = string.Empty;

    public string PreferredLanguage { get; set; } = "es";
}

public class BookingInquiryResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string TourTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string WhatsAppDirectUrl { get; set; } = string.Empty;
}

public class CreateContactMessageDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato de correo no es válido.")]
    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "El asunto es obligatorio.")]
    [StringLength(150)]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "El mensaje no puede estar vacío.")]
    [StringLength(2000)]
    public string Message { get; set; } = string.Empty;
}

public class TestimonialDto
{
    public int Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string TourName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime Date { get; set; }
}
