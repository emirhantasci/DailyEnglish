using System.Security.Claims;
using System.Text;
using System.Text.Json;
using LinguaFlame.Api.Data;
using LinguaFlame.Api.DTOs;
using LinguaFlame.Api.Models;
using LinguaFlame.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────
var dbPath = builder.Configuration["Database:Path"] ?? Path.Combine(AppContext.BaseDirectory, "data", "linguaflame.db");
Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite($"Data Source={dbPath};Cache=Shared"));

// ─── JWT Auth ────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret must be set in configuration");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "linguaflame",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "linguaflame",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();

// ─── CORS ────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
            ?? ["http://localhost:5173", "http://localhost:3000"];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ─── Migrate DB on startup ───────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Enable WAL mode and busy timeout for SQLite concurrency
    db.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");
    db.Database.ExecuteSqlRaw("PRAGMA busy_timeout=5000;");
    db.Database.ExecuteSqlRaw("PRAGMA synchronous=NORMAL;");
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ─── Health ──────────────────────────────────────────────────
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

// ─── Auth: Register ──────────────────────────────────────────
app.MapPost("/api/auth/register", async (RegisterRequest req, AppDbContext db, TokenService tokens) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        return Results.BadRequest(new { error = "Email and password are required" });

    var email = req.Email.Trim().ToLowerInvariant();

    if (await db.Users.AnyAsync(u => u.Email == email))
        return Results.Conflict(new { error = "Email already registered" });

    if (req.Password.Length < 6)
        return Results.BadRequest(new { error = "Password must be at least 6 characters" });

    var user = new User
    {
        Email = email,
        DisplayName = string.IsNullOrWhiteSpace(req.DisplayName) ? email.Split('@')[0] : req.DisplayName.Trim(),
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
        CreatedAt = DateTime.UtcNow,
        LastLoginAt = DateTime.UtcNow,
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
    var progress = new UserProgress
    {
        UserId = user.Id,
        FreezesAvailable = 0,
        JoinedDate = today,
        LastModified = DateTime.UtcNow,
    };
    db.UserProgresses.Add(progress);
    await db.SaveChangesAsync();

    var token = tokens.GenerateToken(user);
    return Results.Ok(new AuthResponse(token, user.Id, user.Email, user.DisplayName));
});

// ─── Auth: Login ─────────────────────────────────────────────
app.MapPost("/api/auth/login", async (LoginRequest req, AppDbContext db, TokenService tokens) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        return Results.BadRequest(new { error = "Email and password are required" });

    var email = req.Email.Trim().ToLowerInvariant();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

    if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        return Results.Unauthorized();

    user.LastLoginAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    var token = tokens.GenerateToken(user);
    return Results.Ok(new AuthResponse(token, user.Id, user.Email, user.DisplayName));
});

// ─── Auth: Me ────────────────────────────────────────────────
app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var email = user.FindFirstValue(ClaimTypes.Email);
    var name = user.FindFirstValue(ClaimTypes.Name);
    return Results.Ok(new { id, email, displayName = name });
}).RequireAuthorization();

// ─── Progress: GET ───────────────────────────────────────────
app.MapGet("/api/progress", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var p = await db.UserProgresses
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.UserId == userId);

    if (p is null) return Results.NotFound(new { error = "No progress found" });

    return Results.Ok(MapToDto(p));
}).RequireAuthorization();

// ─── Progress: PUT ───────────────────────────────────────────
app.MapPut("/api/progress", async (ClaimsPrincipal user, HttpRequest request, AppDbContext db) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    using var doc = await JsonDocument.ParseAsync(request.Body);
    var root = doc.RootElement;

    var p = await db.UserProgresses.FirstOrDefaultAsync(x => x.UserId == userId);
    if (p is null)
    {
        p = new UserProgress { UserId = userId };
        db.UserProgresses.Add(p);
    }

    // Only update if incoming data is newer
    if (root.TryGetProperty("lastModified", out var lmProp) &&
        DateTime.TryParse(lmProp.GetString(), out var incomingTime) &&
        incomingTime <= p.LastModified)
    {
        return Results.Ok(new { success = true, skipped = true, serverTime = p.LastModified });
    }

    MapFromJson(root, p);
    p.LastModified = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(new { success = true, savedAt = p.LastModified });
}).RequireAuthorization();

// ─── Leaderboard ─────────────────────────────────────────────
app.MapGet("/api/leaderboard", async (AppDbContext db) =>
{
    var top = await db.UserProgresses
        .Include(p => p.User)
        .OrderByDescending(p => p.CurrentStreak)
        .ThenByDescending(p => p.TotalScore)
        .Take(20)
        .Select(p => new
        {
            displayName = p.User!.DisplayName,
            currentStreak = p.CurrentStreak,
            longestStreak = p.LongestStreak,
            totalExams = p.TotalExams,
            totalScore = p.TotalScore,
        })
        .ToListAsync();

    return Results.Ok(top);
}).RequireAuthorization();

// ─── Admin: Users ────────────────────────────────────────────
app.MapGet("/api/admin/users", async (ClaimsPrincipal user, AppDbContext db, IConfiguration config) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email);
    var adminEmail = config["Admin:Email"];

    if (string.IsNullOrEmpty(adminEmail) || !string.Equals(email, adminEmail, StringComparison.OrdinalIgnoreCase))
        return Results.Forbid();

    var users = await db.Users
        .Include(u => u.Progress)
        .OrderByDescending(u => u.CreatedAt)
        .Select(u => new
        {
            id = u.Id,
            email = u.Email,
            displayName = u.DisplayName,
            createdAt = u.CreatedAt,
            lastLoginAt = u.LastLoginAt,
            currentStreak = u.Progress != null ? u.Progress.CurrentStreak : 0,
            longestStreak = u.Progress != null ? u.Progress.LongestStreak : 0,
            lastActiveDate = u.Progress != null ? u.Progress.LastActiveDate : null,
            lastModified = u.Progress != null ? u.Progress.LastModified : (DateTime?)null,
            totalExams = u.Progress != null ? u.Progress.TotalExams : 0,
            totalScore = u.Progress != null ? u.Progress.TotalScore : 0,
            totalMaxScore = u.Progress != null ? u.Progress.TotalMaxScore : 0,
            joinedDate = u.Progress != null ? u.Progress.JoinedDate : null,
        })
        .ToListAsync();

    return Results.Ok(users);
}).RequireAuthorization();

// ─── Admin: Check ────────────────────────────────────────────
app.MapGet("/api/admin/check", (ClaimsPrincipal user, IConfiguration config) =>
{
    var email = user.FindFirstValue(ClaimTypes.Email);
    var adminEmail = config["Admin:Email"];
    var isAdmin = !string.IsNullOrEmpty(adminEmail) && string.Equals(email, adminEmail, StringComparison.OrdinalIgnoreCase);
    return Results.Ok(new { isAdmin });
}).RequireAuthorization();

app.Run();

// ─── Helpers ─────────────────────────────────────────────────

static ProgressDto MapToDto(UserProgress p)
{
    var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

    var history = JsonSerializer.Deserialize<Dictionary<string, string>>(p.HistoryJson, opts) ?? [];
    var sessions = JsonSerializer.Deserialize<Dictionary<string, object>>(p.SessionsJson, opts) ?? [];
    var learnedIds = JsonSerializer.Deserialize<List<string>>(p.LearnedWordIdsJson, opts) ?? [];
    var grammarIds = JsonSerializer.Deserialize<List<string>>(p.CompletedGrammarIdsJson, opts) ?? [];

    var streak = new StreakDto(
        p.CurrentStreak,
        p.LongestStreak,
        p.FreezesAvailable,
        p.FreezesUsed,
        p.LastActiveDate,
        p.LastFreezeDate,
        p.ConsecutiveMissedDays,
        history
    );

    return new ProgressDto(
        p.UserId.ToString(),
        p.User?.DisplayName ?? "",
        streak,
        sessions,
        learnedIds,
        grammarIds,
        p.TotalExams,
        p.TotalScore,
        p.TotalMaxScore,
        p.JoinedDate,
        p.LastModified.ToString("O")
    );
}

static void MapFromJson(JsonElement root, UserProgress p)
{
    if (root.TryGetProperty("streak", out var streak))
    {
        if (streak.TryGetProperty("currentStreak", out var cs)) p.CurrentStreak = cs.GetInt32();
        if (streak.TryGetProperty("longestStreak", out var ls)) p.LongestStreak = ls.GetInt32();
        if (streak.TryGetProperty("freezesAvailable", out var fa)) p.FreezesAvailable = fa.GetInt32();
        if (streak.TryGetProperty("freezesUsed", out var fu)) p.FreezesUsed = fu.GetInt32();
        if (streak.TryGetProperty("lastActiveDate", out var lad)) p.LastActiveDate = lad.GetString();
        if (streak.TryGetProperty("lastFreezeDate", out var lfd)) p.LastFreezeDate = lfd.GetString();
        if (streak.TryGetProperty("consecutiveMissedDays", out var cmd)) p.ConsecutiveMissedDays = cmd.GetInt32();
        if (streak.TryGetProperty("history", out var hist)) p.HistoryJson = hist.GetRawText();
    }

    if (root.TryGetProperty("sessions", out var sessions)) p.SessionsJson = sessions.GetRawText();
    if (root.TryGetProperty("learnedWordIds", out var lwi)) p.LearnedWordIdsJson = lwi.GetRawText();
    if (root.TryGetProperty("completedGrammarIds", out var cgi)) p.CompletedGrammarIdsJson = cgi.GetRawText();
    if (root.TryGetProperty("totalExams", out var te)) p.TotalExams = te.GetInt32();
    if (root.TryGetProperty("totalScore", out var ts)) p.TotalScore = ts.GetInt32();
    if (root.TryGetProperty("totalMaxScore", out var tms)) p.TotalMaxScore = tms.GetInt32();
    if (root.TryGetProperty("joinedDate", out var jd)) p.JoinedDate = jd.GetString();
}


