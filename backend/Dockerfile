# Multi-stage build for ASP.NET Core 9 Web API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["ValleSondondo.sln", "./"]
COPY ["src/ValleSondondo.Domain/ValleSondondo.Domain.csproj", "src/ValleSondondo.Domain/"]
COPY ["src/ValleSondondo.Infrastructure/ValleSondondo.Infrastructure.csproj", "src/ValleSondondo.Infrastructure/"]
COPY ["src/ValleSondondo.API/ValleSondondo.API.csproj", "src/ValleSondondo.API/"]

RUN dotnet restore "ValleSondondo.sln"

# Copy all source files and publish
COPY . .
WORKDIR "/src/src/ValleSondondo.API"
RUN dotnet publish "ValleSondondo.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

ENTRYPOINT ["dotnet", "ValleSondondo.API.dll"]
