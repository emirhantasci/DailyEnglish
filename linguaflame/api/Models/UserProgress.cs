using System.Text.Json;

namespace LinguaFlame.Api.Models;

public class UserProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }

    // Streak fields
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public int FreezesAvailable { get; set; }
    public int FreezesUsed { get; set; }
    public string? LastActiveDate { get; set; }
    public string? LastFreezeDate { get; set; }
    public int ConsecutiveMissedDays { get; set; }

    // JSON blobs stored as TEXT in SQLite
    public string HistoryJson { get; set; } = "{}";
    public string SessionsJson { get; set; } = "{}";
    public string LearnedWordIdsJson { get; set; } = "[]";
    public string CompletedGrammarIdsJson { get; set; } = "[]";

    // Stats
    public int TotalExams { get; set; }
    public int TotalScore { get; set; }
    public int TotalMaxScore { get; set; }
    public string? JoinedDate { get; set; }
    public DateTime LastModified { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
}
