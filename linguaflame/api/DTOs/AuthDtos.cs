namespace LinguaFlame.Api.DTOs;

public record RegisterRequest(string Email, string DisplayName, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, int UserId, string Email, string DisplayName);

public record ProgressDto(
    string UserId,
    string DisplayName,
    StreakDto Streak,
    Dictionary<string, object> Sessions,
    List<string> LearnedWordIds,
    List<string> CompletedGrammarIds,
    int TotalExams,
    int TotalScore,
    int TotalMaxScore,
    string? JoinedDate,
    string LastModified
);

public record StreakDto(
    int CurrentStreak,
    int LongestStreak,
    int FreezesAvailable,
    int FreezesUsed,
    string? LastActiveDate,
    string? LastFreezeDate,
    int ConsecutiveMissedDays,
    Dictionary<string, string> History
);
