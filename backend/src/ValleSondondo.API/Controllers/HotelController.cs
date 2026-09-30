using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ValleSondondo.API.DTOs;

namespace ValleSondondo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private static readonly object _lock = new();
    private static HotelInfoDto? _cachedHotelInfo;
    private static List<HotelBookingDto>? _cachedBookings;
    private static readonly string StorageDir = Path.Combine(AppContext.BaseDirectory, "hotel_storage");
    private static readonly string HotelFilePath = Path.Combine(StorageDir, "hotel_info.json");
    private static readonly string BookingsFilePath = Path.Combine(StorageDir, "hotel_bookings.json");

    public HotelController(IConfiguration configuration)
    {
        _configuration = configuration;
        EnsureDataLoaded();
    }

    [HttpGet]
    public IActionResult GetHotelInfo([FromQuery] bool includeInactive = true)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var info = new HotelInfoDto
            {
                Name = _cachedHotelInfo!.Name,
                Stars = _cachedHotelInfo.Stars,
                Tagline = _cachedHotelInfo.Tagline,
                Address = _cachedHotelInfo.Address,
                City = _cachedHotelInfo.City,
                PostalCode = _cachedHotelInfo.PostalCode,
                Description = _cachedHotelInfo.Description,
                BookingUrl = _cachedHotelInfo.BookingUrl,
                WhatsAppNumber = _cachedHotelInfo.WhatsAppNumber,
                CheckInTime = _cachedHotelInfo.CheckInTime,
                CheckOutTime = _cachedHotelInfo.CheckOutTime,
                FeaturedAmenities = new List<HotelAmenityDto>(_cachedHotelInfo.FeaturedAmenities),
                Rooms = includeInactive 
                    ? new List<HotelRoomDto>(_cachedHotelInfo.Rooms)
                    : _cachedHotelInfo.Rooms.Where(r => r.IsActive).ToList(),
                DateBlocks = new List<HotelDateBlockDto>(_cachedHotelInfo.DateBlocks ?? new())
            };

            return Ok(info);
        }
    }

    [Authorize]
    [HttpPut]
    public IActionResult UpdateHotelInfo([FromBody] HotelInfoDto updatedInfo)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            _cachedHotelInfo!.Name = updatedInfo.Name;
            _cachedHotelInfo.Stars = updatedInfo.Stars;
            _cachedHotelInfo.Tagline = updatedInfo.Tagline;
            _cachedHotelInfo.Address = updatedInfo.Address;
            _cachedHotelInfo.City = updatedInfo.City;
            _cachedHotelInfo.PostalCode = updatedInfo.PostalCode;
            _cachedHotelInfo.Description = updatedInfo.Description;
            _cachedHotelInfo.BookingUrl = updatedInfo.BookingUrl;
            _cachedHotelInfo.WhatsAppNumber = updatedInfo.WhatsAppNumber;
            _cachedHotelInfo.CheckInTime = updatedInfo.CheckInTime;
            _cachedHotelInfo.CheckOutTime = updatedInfo.CheckOutTime;
            _cachedHotelInfo.FeaturedAmenities = updatedInfo.FeaturedAmenities ?? new List<HotelAmenityDto>();
            if (updatedInfo.DateBlocks != null)
            {
                _cachedHotelInfo.DateBlocks = updatedInfo.DateBlocks;
            }

            SaveHotelInfoToFile();
            return Ok(_cachedHotelInfo);
        }
    }

    [HttpGet("rooms")]
    public IActionResult GetRooms([FromQuery] bool includeInactive = true)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var rooms = includeInactive
                ? _cachedHotelInfo!.Rooms
                : _cachedHotelInfo!.Rooms.Where(r => r.IsActive).ToList();

            return Ok(rooms);
        }
    }

    [HttpGet("rooms/{id}")]
    public IActionResult GetRoomById(int id)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var room = _cachedHotelInfo!.Rooms.FirstOrDefault(r => r.Id == id);
            if (room == null) return NotFound(new { message = "Habitación no encontrada" });
            return Ok(room);
        }
    }

    [Authorize]
    [HttpPost("rooms")]
    public IActionResult CreateRoom([FromBody] HotelRoomDto newRoom)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var nextId = _cachedHotelInfo!.Rooms.Count > 0 
                ? _cachedHotelInfo.Rooms.Max(r => r.Id) + 1 
                : 1;

            newRoom.Id = nextId;
            if (string.IsNullOrWhiteSpace(newRoom.Slug))
            {
                newRoom.Slug = GenerateSlug(newRoom.Title);
            }

            _cachedHotelInfo.Rooms.Add(newRoom);
            SaveHotelInfoToFile();
            return CreatedAtAction(nameof(GetRoomById), new { id = newRoom.Id }, newRoom);
        }
    }

    [Authorize]
    [HttpPut("rooms/{id}")]
    public IActionResult UpdateRoom(int id, [FromBody] HotelRoomDto updatedRoom)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var existingIndex = _cachedHotelInfo!.Rooms.FindIndex(r => r.Id == id);
            if (existingIndex < 0) return NotFound(new { message = "Habitación no encontrada" });

            updatedRoom.Id = id;
            if (string.IsNullOrWhiteSpace(updatedRoom.Slug))
            {
                updatedRoom.Slug = GenerateSlug(updatedRoom.Title);
            }

            _cachedHotelInfo.Rooms[existingIndex] = updatedRoom;
            SaveHotelInfoToFile();
            return Ok(updatedRoom);
        }
    }

    [Authorize]
    [HttpPatch("rooms/{id}/toggle-active")]
    public IActionResult ToggleRoomActive(int id)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var room = _cachedHotelInfo!.Rooms.FirstOrDefault(r => r.Id == id);
            if (room == null) return NotFound(new { message = "Habitación no encontrada" });

            room.IsActive = !room.IsActive;
            SaveHotelInfoToFile();
            return Ok(new { id = room.Id, isActive = room.IsActive });
        }
    }

    [Authorize]
    [HttpDelete("rooms/{id}")]
    public IActionResult DeleteRoom(int id)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var count = _cachedHotelInfo!.Rooms.RemoveAll(r => r.Id == id);
            if (count == 0) return NotFound(new { message = "Habitación no encontrada" });

            SaveHotelInfoToFile();
            return NoContent();
        }
    }

    [Authorize]
    [HttpPatch("rooms/{id}/housekeeping")]
    public IActionResult UpdateRoomHousekeeping(int id, [FromBody] UpdateHousekeepingDto dto)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var room = _cachedHotelInfo!.Rooms.FirstOrDefault(r => r.Id == id);
            if (room == null) return NotFound(new { message = "Habitación no encontrada" });

            room.HousekeepingStatus = dto.HousekeepingStatus;
            SaveHotelInfoToFile();
            return Ok(new { id = room.Id, housekeepingStatus = room.HousekeepingStatus });
        }
    }

    // --- DATE BLOCKS & SEASON RATES ---

    [HttpGet("date-blocks")]
    public IActionResult GetDateBlocks()
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            return Ok(_cachedHotelInfo!.DateBlocks ?? new List<HotelDateBlockDto>());
        }
    }

    [Authorize]
    [HttpPost("date-blocks")]
    public IActionResult CreateDateBlock([FromBody] HotelDateBlockDto block)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            _cachedHotelInfo!.DateBlocks ??= new List<HotelDateBlockDto>();
            var nextId = _cachedHotelInfo.DateBlocks.Count > 0 
                ? _cachedHotelInfo.DateBlocks.Max(d => d.Id) + 1 
                : 1;

            block.Id = nextId;
            block.CreatedAt = DateTime.UtcNow;

            if (block.RoomId.HasValue && block.RoomId > 0 && string.IsNullOrWhiteSpace(block.RoomTitle))
            {
                var room = _cachedHotelInfo.Rooms.FirstOrDefault(r => r.Id == block.RoomId.Value);
                if (room != null) block.RoomTitle = room.Title;
            }

            _cachedHotelInfo.DateBlocks.Add(block);
            SaveHotelInfoToFile();
            return Ok(block);
        }
    }

    [Authorize]
    [HttpDelete("date-blocks/{id}")]
    public IActionResult DeleteDateBlock(int id)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            if (_cachedHotelInfo!.DateBlocks == null) return NotFound(new { message = "Bloqueo no encontrado" });
            var removed = _cachedHotelInfo.DateBlocks.RemoveAll(d => d.Id == id);
            if (removed == 0) return NotFound(new { message = "Bloqueo no encontrado" });

            SaveHotelInfoToFile();
            return NoContent();
        }
    }

    // --- BOOKINGS (RESERVAS DE HOSPEDAJE) ---

    [Authorize]
    [HttpGet("bookings")]
    public IActionResult GetBookings([FromQuery] string? status, [FromQuery] string? search)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var list = _cachedBookings!.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                list = list.Where(b => b.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                list = list.Where(b => 
                    b.GuestName.ToLower().Contains(s) ||
                    b.GuestPhone.Contains(s) ||
                    b.GuestEmail.ToLower().Contains(s) ||
                    b.RoomTitle.ToLower().Contains(s) ||
                    b.VoucherCode.ToLower().Contains(s));
            }

            return Ok(list.OrderByDescending(b => b.CreatedAt).ToList());
        }
    }

    [EnableRateLimiting("contact-policy")]
    [HttpPost("bookings")]
    public IActionResult CreateBooking([FromBody] HotelBookingDto booking)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var nextId = _cachedBookings!.Count > 0 
                ? _cachedBookings.Max(b => b.Id) + 1 
                : 1;

            booking.Id = nextId;
            booking.CreatedAt = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(booking.VoucherCode))
            {
                booking.VoucherCode = $"HPC-{DateTime.UtcNow.Year}-{nextId:D3}";
            }

            var agencyNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";
            booking.WhatsAppDirectUrl = BuildWhatsAppUrl(booking, agencyNumber);

            _cachedBookings.Add(booking);
            SaveBookingsToFile();
            return Ok(booking);
        }
    }

    [Authorize]
    [HttpPatch("bookings/{id}/status")]
    public IActionResult UpdateBookingStatus(int id, [FromBody] UpdateHotelBookingStatusDto dto)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var booking = _cachedBookings!.FirstOrDefault(b => b.Id == id);
            if (booking == null) return NotFound(new { message = "Reserva no encontrada" });

            booking.Status = dto.Status;
            SaveBookingsToFile();
            return Ok(booking);
        }
    }

    [Authorize]
    [HttpDelete("bookings/{id}")]
    public IActionResult DeleteBooking(int id)
    {
        EnsureDataLoaded();
        lock (_lock)
        {
            var removed = _cachedBookings!.RemoveAll(b => b.Id == id);
            if (removed == 0) return NotFound(new { message = "Reserva no encontrada" });

            SaveBookingsToFile();
            return NoContent();
        }
    }

    // --- HELPER METHODS ---

    private void EnsureDataLoaded()
    {
        if (_cachedHotelInfo != null && _cachedBookings != null) return;

        lock (_lock)
        {
            if (_cachedHotelInfo != null && _cachedBookings != null) return;

            Directory.CreateDirectory(StorageDir);

            if (System.IO.File.Exists(HotelFilePath))
            {
                try
                {
                    var json = System.IO.File.ReadAllText(HotelFilePath);
                    _cachedHotelInfo = JsonSerializer.Deserialize<HotelInfoDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                catch { }
            }

            if (_cachedHotelInfo == null)
            {
                _cachedHotelInfo = GetDefaultHotelInfo();
                SaveHotelInfoToFile();
            }

            if (System.IO.File.Exists(BookingsFilePath))
            {
                try
                {
                    var json = System.IO.File.ReadAllText(BookingsFilePath);
                    _cachedBookings = JsonSerializer.Deserialize<List<HotelBookingDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                catch { }
            }

            if (_cachedBookings == null)
            {
                _cachedBookings = GetDefaultBookings();
                SaveBookingsToFile();
            }
        }
    }

    private static void SaveHotelInfoToFile()
    {
        try
        {
            Directory.CreateDirectory(StorageDir);
            var json = JsonSerializer.Serialize(_cachedHotelInfo, new JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(HotelFilePath, json);
        }
        catch { }
    }

    private static void SaveBookingsToFile()
    {
        try
        {
            Directory.CreateDirectory(StorageDir);
            var json = JsonSerializer.Serialize(_cachedBookings, new JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(BookingsFilePath, json);
        }
        catch { }
    }

    private static string GenerateSlug(string text)
    {
        var str = text.ToLowerInvariant();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = str.Replace(" ", "-");
        return str;
    }

    private static string BuildWhatsAppUrl(HotelBookingDto booking, string agencyNumber)
    {
        var cleanPhone = new string(booking.GuestPhone.Where(char.IsDigit).ToArray());
        if (cleanPhone.Length == 9 && !cleanPhone.StartsWith("51"))
        {
            cleanPhone = "51" + cleanPhone;
        }

        if (string.IsNullOrWhiteSpace(cleanPhone))
        {
            cleanPhone = agencyNumber;
        }

        var message = $"¡Hola {booking.GuestName}! 👋 Te saludamos desde *Hotel Punto Clave & Valle del Sondondo Expeditions*.\n" +
                      $"Confirmamos la gestión de tu reserva para *{booking.RoomTitle}*.\n" +
                      $"📅 Check-in: {booking.CheckInDate} | Check-out: {booking.CheckOutDate} ({booking.Nights} noche(s))\n" +
                      $"🏷️ Código de Voucher: *{booking.VoucherCode}*\n" +
                      $"Cualquier duda o solicitud especial, estamos para asistirte.";

        return $"https://wa.me/{cleanPhone}?text={WebUtility.UrlEncode(message)}";
    }

    private HotelInfoDto GetDefaultHotelInfo()
    {
        var whatsapp = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";
        return new HotelInfoDto
        {
            Name = "Hotel Punto Clave",
            Stars = 3,
            Tagline = "Alojamiento oficial y descanso confortable con balcón privado, terraza e hidromasaje",
            Address = "Mz.B - Lt.6 Calle Los Ficus",
            City = "Ica",
            PostalCode = "11004",
            Description = "Punto Clave, que cuenta con jardín, terraza y servicio de habitaciones, es un hotel de 3 estrellas en Ica. Ofrece recepción abierta las 24 horas, WiFi gratuito de alta velocidad en todo el establecimiento y estacionamiento privado gratuito. Cada habitación dispone de balcón privado con vistas, baño privado con ducha y artículos de aseo gratuitos, TV de pantalla plana, escritorio y ropa de cama.",
            WhatsAppNumber = whatsapp,
            CheckInTime = "A partir de las 13:00 hrs",
            CheckOutTime = "Hasta las 12:00 hrs",
            FeaturedAmenities = new List<HotelAmenityDto>
            {
                new() { Name = "WiFi Gratis", Icon = "wifi", Description = "Conexión de alta velocidad en todo el alojamiento" },
                new() { Name = "Parking Privado Gratis", Icon = "parking", Description = "Estacionamiento seguro en el establecimiento" },
                new() { Name = "Recepción 24 Horas", Icon = "clock", Description = "Atención continua y asistencia a huéspedes" },
                new() { Name = "Balcón en Cada Habitación", Icon = "sun", Description = "Vistas exteriores y ventilación natural" },
                new() { Name = "Bañera de Hidromasaje", Icon = "bath", Description = "Relax y descanso en apartamentos dúplex" },
                new() { Name = "Terraza & Jardín", Icon = "compass", Description = "Áreas al aire libre para relajarse" },
                new() { Name = "Cocina Privada (Dúplex)", Icon = "coffee", Description = "Equipada para estancias prolongadas" },
                new() { Name = "TV Pantalla Plana", Icon = "tv", Description = "Entretenimiento y confort en cada habitación" }
            },
            Rooms = new List<HotelRoomDto>
            {
                new()
                {
                    Id = 1,
                    Title = "Habitación Doble",
                    Slug = "habitacion-doble",
                    ShortDescription = "Acogedora habitación matrimonial con balcón exterior, TV y baño privado.",
                    Description = "Habitación privada con 1 cama doble matrimonial, balcón privado, televisión de pantalla plana, escritorio de trabajo y baño privado equipado con ducha y artículos de aseo gratuitos. Perfecta para parejas o viajeros que buscan confort y descanso reparador.",
                    CapacityText = "2 Adultos",
                    CapacityAdults = 2,
                    BedConfiguration = "1 Cama Doble",
                    PricePerNightSoles = 85,
                    PricePerNightUsd = 23,
                    MainImage = "/assets/images/hotel/room_double.jpg",
                    Gallery = new List<string>
                    {
                        "/assets/images/hotel/room_double.jpg",
                        "/assets/images/hotel/room_double_alt.jpg",
                        "/assets/images/hotel/hotel_bathroom.jpg",
                        "/assets/images/hotel/hotel_terrace.jpg",
                        "/assets/images/hotel/hotel_main.jpg"
                    },
                    Amenities = new List<string>
                    {
                        "WiFi de alta velocidad gratuito",
                        "Balcón privado con vista",
                        "Baño privado con ducha y agua caliente",
                        "Artículos de aseo gratuitos y toallas",
                        "TV de pantalla plana",
                        "Escritorio de trabajo",
                        "Ropa de cama hipoalergénica",
                        "Caja fuerte"
                    },
                    Highlights = new List<string> { "1 cama doble", "Balcón privado", "Baño privado", "WiFi gratis" },
                    IsActive = true,
                    TotalUnits = 3,
                    FloorOrZone = "Piso 1 y 2",
                    HousekeepingStatus = "clean"
                },
                new()
                {
                    Id = 2,
                    Title = "Habitación Triple Estándar",
                    Slug = "habitacion-triple-estandar",
                    ShortDescription = "Habitación amplia con 3 camas (2 individuales + 1 doble), balcón y baño privado.",
                    Description = "Espaciosa y funcional, ideal para familias o grupos de amigos. Equipada con 2 camas individuales confortables y 1 cama doble, balcón privado exterior, TV de pantalla plana, escritorio y baño privado completo con ducha y amenidades de cortesía.",
                    CapacityText = "Hasta 4 Huéspedes",
                    CapacityAdults = 4,
                    BedConfiguration = "2 Camas Individuales + 1 Cama Doble",
                    PricePerNightSoles = 130,
                    PricePerNightUsd = 35,
                    MainImage = "/assets/images/hotel/room_triple.jpg",
                    Gallery = new List<string>
                    {
                        "/assets/images/hotel/room_triple.jpg",
                        "/assets/images/hotel/room_triple_alt.jpg",
                        "/assets/images/hotel/hotel_bathroom.jpg",
                        "/assets/images/hotel/hotel_terrace.jpg",
                        "/assets/images/hotel/hotel_facade.jpg"
                    },
                    Amenities = new List<string>
                    {
                        "WiFi de alta velocidad gratuito",
                        "Balcón privado",
                        "Baño privado con ducha y agua caliente",
                        "Artículos de aseo gratuitos y toallas",
                        "TV de pantalla plana",
                        "Escritorio de trabajo",
                        "Ropa de cama completa",
                        "Caja fuerte"
                    },
                    Highlights = new List<string> { "2 individuales + 1 doble", "Capacidad 4 personas", "Balcón exterior", "Baño privado" },
                    IsActive = true,
                    TotalUnits = 2,
                    FloorOrZone = "Piso 2",
                    HousekeepingStatus = "dirty"
                },
                new()
                {
                    Id = 3,
                    Title = "Apartamento Dúplex",
                    Slug = "apartamento-duplex",
                    ShortDescription = "Apartamento en dos plantas con cocina equipada, sala, terraza e hidromasaje.",
                    Description = "La experiencia premium de Punto Clave. Diseñado en dos niveles, dispone de dormitorio principal con cama grande, zona de cocina privada equipada con electrodomésticos, sala de estar, terraza privada al aire libre, TV de pantalla plana y baño amplio con bañera de hidromasaje para relajación total.",
                    CapacityText = "3 a 4 Huéspedes",
                    CapacityAdults = 4,
                    BedConfiguration = "1 Cama Doble Grande + Sala de Estar Dúplex",
                    PricePerNightSoles = 175,
                    PricePerNightUsd = 48,
                    MainImage = "/assets/images/hotel/room_duplex.jpg",
                    Gallery = new List<string>
                    {
                        "/assets/images/hotel/room_duplex.jpg",
                        "/assets/images/hotel/room_duplex_alt.jpg",
                        "/assets/images/hotel/hotel_kitchen.jpg",
                        "/assets/images/hotel/hotel_terrace.jpg",
                        "/assets/images/hotel/hotel_bathroom.jpg",
                        "/assets/images/hotel/hotel_main.jpg"
                    },
                    Amenities = new List<string>
                    {
                        "Bañera de hidromasaje / Jacuzzi",
                        "Zona de cocina privada y equipada",
                        "Terraza / balcón amplio con vistas",
                        "WiFi de alta velocidad gratuito",
                        "Sala de estar integrada",
                        "TV de pantalla plana",
                        "Baño privado de lujo con artículos de aseo",
                        "Ropa de cama y toallas de algodón"
                    },
                    Highlights = new List<string> { "Cocina privada equipada", "Bañera de hidromasaje", "Terraza privada", "Diseño dúplex" },
                    IsActive = true,
                    TotalUnits = 1,
                    FloorOrZone = "Piso 3 Ático",
                    HousekeepingStatus = "occupied"
                }
            },
            DateBlocks = new List<HotelDateBlockDto>
            {
                new()
                {
                    Id = 1,
                    RoomId = 0,
                    RoomTitle = "Todas las habitaciones",
                    StartDate = DateTime.UtcNow.AddDays(15).ToString("yyyy-MM-dd"),
                    EndDate = DateTime.UtcNow.AddDays(18).ToString("yyyy-MM-dd"),
                    Reason = "Fiesta del Agua Yaku Raymi - Temporada Festiva",
                    IsBlocked = false,
                    PriceOverrideSoles = 110,
                    PriceOverrideUsd = 30,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new()
                {
                    Id = 2,
                    RoomId = 2,
                    RoomTitle = "Habitación Triple Estándar",
                    StartDate = DateTime.UtcNow.AddDays(22).ToString("yyyy-MM-dd"),
                    EndDate = DateTime.UtcNow.AddDays(24).ToString("yyyy-MM-dd"),
                    Reason = "Mantenimiento Preventivo de Red Sanitaria",
                    IsBlocked = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                }
            }
        };
    }

    private List<HotelBookingDto> GetDefaultBookings()
    {
        var agencyNumber = _configuration["AgencySettings:WhatsAppNumber"] ?? "51966380590";
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var tomorrow = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd");
        var yesterday = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd");
        var inTwoDays = DateTime.UtcNow.AddDays(2).ToString("yyyy-MM-dd");

        return new List<HotelBookingDto>
        {
            new()
            {
                Id = 1,
                VoucherCode = "HPC-2026-001",
                GuestName = "Carlos Méndez Quispe",
                GuestEmail = "carlos.mendez@gmail.com",
                GuestPhone = "+51 984 567 890",
                GuestDocumentType = "DNI",
                GuestDocumentNumber = "43892019",
                RoomId = 1,
                RoomTitle = "Habitación Doble",
                CheckInDate = today,
                CheckOutDate = inTwoDays,
                Nights = 2,
                NumberOfGuests = 2,
                TotalPriceSoles = 170,
                PaidAmountSoles = 170,
                PaymentMethod = "MercadoPago",
                PaymentStatus = "Pagado 100%",
                Status = "Confirmed", // LLegada hoy para Check-In
                SpecialRequests = "Llegada estimada a las 14:30 hrs. Cama matrimonial requerida.",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                WhatsAppDirectUrl = $"https://wa.me/51984567890?text={WebUtility.UrlEncode("Hola Carlos, confirmamos tu estadía en Hotel Punto Clave")}"
            },
            new()
            {
                Id = 2,
                VoucherCode = "HPC-2026-002",
                GuestName = "Sofía Alarcón Dávila",
                GuestEmail = "sofia.alarcon@turismo.pe",
                GuestPhone = "+51 956 712 344",
                GuestDocumentType = "DNI",
                GuestDocumentNumber = "41098231",
                RoomId = 3,
                RoomTitle = "Apartamento Dúplex",
                CheckInDate = yesterday,
                CheckOutDate = today,
                Nights = 1,
                NumberOfGuests = 2,
                TotalPriceSoles = 175,
                PaidAmountSoles = 175,
                PaymentMethod = "Transferencia BCP",
                PaymentStatus = "Pagado 100%",
                Status = "CheckedIn", // Salida hoy para Check-Out
                SpecialRequests = "Check-out programado para las 11:30 hrs antes del tour.",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                WhatsAppDirectUrl = $"https://wa.me/51956712344?text={WebUtility.UrlEncode("Hola Sofía, gracias por tu visita a Hotel Punto Clave")}"
            },
            new()
            {
                Id = 3,
                VoucherCode = "HPC-2026-003",
                GuestName = "Martina Valenzuela Soto",
                GuestEmail = "mvalenzuela@empresa.pe",
                GuestPhone = "+51 966 234 111",
                GuestDocumentType = "DNI",
                GuestDocumentNumber = "71209382",
                RoomId = 2,
                RoomTitle = "Habitación Triple Estándar",
                CheckInDate = tomorrow,
                CheckOutDate = DateTime.UtcNow.AddDays(4).ToString("yyyy-MM-dd"),
                Nights = 3,
                NumberOfGuests = 3,
                TotalPriceSoles = 390,
                PaidAmountSoles = 195,
                PaymentMethod = "Transferencia BCP",
                PaymentStatus = "Adelanto 50%",
                Status = "Confirmed",
                SpecialRequests = "Solicitan estacionamiento seguro para camioneta 4x4.",
                CreatedAt = DateTime.UtcNow.AddHours(-18),
                WhatsAppDirectUrl = $"https://wa.me/51966234111?text={WebUtility.UrlEncode("Hola Martina, recibimos tu solicitud de reserva para Habitación Triple")}"
            }
        };
    }
}
