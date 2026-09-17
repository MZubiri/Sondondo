namespace ValleSondondo.Domain.Entities;

public class Testimonial
{
    public int Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty; // e.g. "Lima, Perú"
    public int Rating { get; set; } = 5; // 1 to 5
    public string Comment { get; set; } = string.Empty;
    public string TourName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public bool IsApproved { get; set; } = true;
}
