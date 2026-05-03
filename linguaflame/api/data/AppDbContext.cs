using LinguaFlame.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LinguaFlame.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
            e.HasOne(u => u.Progress)
             .WithOne(p => p.User)
             .HasForeignKey<UserProgress>(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserProgress>(e =>
        {
            e.HasKey(p => p.Id);
        });
    }
}
