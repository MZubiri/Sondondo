using Microsoft.AspNetCore.Mvc;
using ValleSondondo.API.DTOs;

namespace ValleSondondo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var expectedUser = _configuration["AdminSettings:Username"] ?? "admin@valledelsondondo.com";
        var expectedPass = _configuration["AdminSettings:Password"] ?? "Sondondo2026!";

        // Clean and compare
        var inputUser = request.Username.Trim();
        var inputPass = request.Password.Trim();

        bool isValid = (string.Equals(inputUser, expectedUser, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(inputUser, "admin", StringComparison.OrdinalIgnoreCase)) &&
                       string.Equals(inputPass, expectedPass, StringComparison.Ordinal);

        if (!isValid)
        {
            return Unauthorized(new { message = "Credenciales incorrectas. Verifique usuario o contraseña." });
        }

        // Generate simple secure session token
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "-" + DateTime.UtcNow.Ticks;

        return Ok(new LoginResponseDto
        {
            Token = token,
            Username = expectedUser,
            FullName = "Administrador Valle del Sondondo",
            Role = "Administrator",
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
    }
}
