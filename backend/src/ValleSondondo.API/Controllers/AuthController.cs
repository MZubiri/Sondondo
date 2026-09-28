using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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

        // Generate standard signed JWT token
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "ValleDelSondondoExpeditions_SecretKey_AyacuchoPeru_2026_SecureKeyJwtToken!";
        var issuer = jwtSettings["Issuer"] ?? "ValleSondondoAPI";
        var audience = jwtSettings["Audience"] ?? "ValleSondondoClients";
        var expirationDays = int.TryParse(jwtSettings["ExpirationDays"], out var exp) ? exp : 7;
        var expiresAt = DateTime.UtcNow.AddDays(expirationDays);

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(secretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, expectedUser),
                new Claim(ClaimTypes.Name, "Administrador Valle del Sondondo"),
                new Claim(ClaimTypes.Email, expectedUser),
                new Claim(ClaimTypes.Role, "Administrator"),
                new Claim("agency", "Valle del Sondondo Expeditions")
            }),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(securityToken);

        return Ok(new LoginResponseDto
        {
            Token = tokenString,
            Username = expectedUser,
            FullName = "Administrador Valle del Sondondo",
            Role = "Administrator",
            ExpiresAt = expiresAt
        });
    }
}
