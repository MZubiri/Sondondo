namespace ValleSondondo.Domain.Entities;

public class Tour
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    
    public string Duration { get; set; } = string.Empty; // e.g. "Full Day", "2 Días / 1 Noche"
    public int DurationDays { get; set; } = 1;
    
    public decimal PriceSoles { get; set; }
    public decimal PriceUsd { get; set; }
    
    public string Difficulty { get; set; } = "Moderado"; // Fácil, Moderado, Exigente
    public string AltitudeMax { get; set; } = string.Empty; // e.g. "3,600 msnm", "5,112 msnm"
    public string StartingPoint { get; set; } = "Aucará / Puquio";
    
    public bool Featured { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    
    public string MainImageUrl { get; set; } = string.Empty;
    public string GalleryImagesJson { get; set; } = "[]"; // List of URLs
    public string IncludedJson { get; set; } = "[]"; // Items included
    public string NotIncludedJson { get; set; } = "[]"; // Items not included
    public string RecommendationsJson { get; set; } = "[]"; // Packing/preparation tips
    
    public ICollection<ItineraryDay> Itineraries { get; set; } = new List<ItineraryDay>();
    public ICollection<BookingInquiry> BookingInquiries { get; set; } = new List<BookingInquiry>();
}
