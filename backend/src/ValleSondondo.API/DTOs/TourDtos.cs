namespace ValleSondondo.API.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public int ToursCount { get; set; }
}

public class TourSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public decimal PriceSoles { get; set; }
    public decimal PriceUsd { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public string AltitudeMax { get; set; } = string.Empty;
    public string StartingPoint { get; set; } = string.Empty;
    public bool Featured { get; set; }
    public string MainImageUrl { get; set; } = string.Empty;
}

public class TourDetailDto : TourSummaryDto
{
    public string Description { get; set; } = string.Empty;
    public List<string> GalleryImages { get; set; } = new();
    public List<string> Included { get; set; } = new();
    public List<string> NotIncluded { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public List<ItineraryDayDto> Itineraries { get; set; } = new();
}

public class ItineraryDayDto
{
    public int Id { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Activities { get; set; } = string.Empty;
    public string Meals { get; set; } = string.Empty;
    public string Accommodation { get; set; } = string.Empty;
}
