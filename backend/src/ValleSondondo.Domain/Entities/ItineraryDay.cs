namespace ValleSondondo.Domain.Entities;

public class ItineraryDay
{
    public int Id { get; set; }
    public int TourId { get; set; }
    public Tour? Tour { get; set; }
    
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Activities { get; set; } = string.Empty; // Summary or bullet points
    public string Meals { get; set; } = string.Empty; // e.g. "Desayuno tradicional, Almuerzo campestre"
    public string Accommodation { get; set; } = string.Empty; // e.g. "Hospedaje rural en Andamarca"
}
