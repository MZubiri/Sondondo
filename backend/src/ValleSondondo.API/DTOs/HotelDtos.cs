using System.ComponentModel.DataAnnotations;

namespace ValleSondondo.API.DTOs;

public class HotelAmenityDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "check";
    public string? Description { get; set; }
}

public class HotelRoomDto
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string ShortDescription { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string CapacityText { get; set; } = "2 Adultos";

    public int CapacityAdults { get; set; } = 2;

    public string BedConfiguration { get; set; } = "1 Cama Doble";

    public decimal PricePerNightSoles { get; set; }

    public decimal PricePerNightUsd { get; set; }

    public string MainImage { get; set; } = "/assets/images/hotel/room_double.jpg";

    public List<string> Gallery { get; set; } = new();

    public List<string> Amenities { get; set; } = new();

    public List<string> Highlights { get; set; } = new();

    public string? BookingRoomUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public int TotalUnits { get; set; } = 1;

    public string? FloorOrZone { get; set; }

    public string HousekeepingStatus { get; set; } = "clean"; // clean, dirty, occupied, maintenance
}

public class HotelDateBlockDto
{
    public int Id { get; set; }
    public int? RoomId { get; set; } // null or 0 = all rooms
    public string? RoomTitle { get; set; }
    [Required]
    public string StartDate { get; set; } = string.Empty; // YYYY-MM-DD
    [Required]
    public string EndDate { get; set; } = string.Empty; // YYYY-MM-DD
    [Required]
    public string Reason { get; set; } = string.Empty;
    public bool IsBlocked { get; set; } = true;
    public decimal? PriceOverrideSoles { get; set; }
    public decimal? PriceOverrideUsd { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateHousekeepingDto
{
    [Required]
    public string HousekeepingStatus { get; set; } = "clean";
}

public class HotelInfoDto
{
    public string Name { get; set; } = "Hotel Punto Clave";
    public int Stars { get; set; } = 3;
    public string Tagline { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = "Ica";
    public string PostalCode { get; set; } = "11004";
    public string Description { get; set; } = string.Empty;
    public string? BookingUrl { get; set; }
    public string WhatsAppNumber { get; set; } = "51966380590";
    public string CheckInTime { get; set; } = "A partir de las 13:00 hrs";
    public string CheckOutTime { get; set; } = "Hasta las 12:00 hrs";
    public List<HotelAmenityDto> FeaturedAmenities { get; set; } = new();
    public List<HotelRoomDto> Rooms { get; set; } = new();
    public List<HotelDateBlockDto> DateBlocks { get; set; } = new();
}

public class HotelBookingDto
{
    public int Id { get; set; }
    public string VoucherCode { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string? GuestDocumentType { get; set; } = "DNI";
    public string? GuestDocumentNumber { get; set; }
    public int RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string CheckInDate { get; set; } = string.Empty;
    public string CheckOutDate { get; set; } = string.Empty;
    public int Nights { get; set; } = 1;
    public int NumberOfGuests { get; set; } = 2;
    public decimal TotalPriceSoles { get; set; }
    public decimal? PaidAmountSoles { get; set; }
    public string? PaymentMethod { get; set; } = "Pendiente";
    public string? PaymentStatus { get; set; } = "Pendiente";
    public string Status { get; set; } = "Pending";
    public string? SpecialRequests { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? WhatsAppDirectUrl { get; set; }
}

public class UpdateHotelBookingStatusDto
{
    [Required]
    public string Status { get; set; } = "Pending";
}
