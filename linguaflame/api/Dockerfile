# ── Build stage ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy all source files
COPY . .

# Restore and publish in a single command
RUN dotnet publish api/ -c Release -o /app

# ── Runtime stage ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install SQLite native libs and curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsqlite3-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app .

# Persistent volume mount point for SQLite DB
# The /app/data directory is created by the build, no need to RUN mkdir
# RUN mkdir -p /app/data

EXPOSE 5001
ENV ASPNETCORE_URLS=http://0.0.0.0:5001
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "LinguaFlame.Api.dll"]
