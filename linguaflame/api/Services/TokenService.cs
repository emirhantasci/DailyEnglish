using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LinguaFlame.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace LinguaFlame.Api.Services;

public class TokenService(IConfiguration config)
{
    public string GenerateToken(User user)
    {
        var secret = config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
        };

        var expireHours = int.TryParse(config["Jwt:ExpiresHours"], out var h) ? h : 720; // 30 days default

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"] ?? "linguaflame",
            audience: config["Jwt:Audience"] ?? "linguaflame",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expireHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
