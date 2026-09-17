using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ValleSondondo.Infrastructure.Data;

public class ValleSondondoDbContextFactory : IDesignTimeDbContextFactory<ValleSondondoDbContext>
{
    public ValleSondondoDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ValleSondondoDbContext>();
        
        var connectionString = "Server=localhost;Port=3306;Database=valle_sondondo_db;User=root;Password=password;CharSet=utf8mb4;";
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));

        optionsBuilder.UseMySql(connectionString, serverVersion);

        return new ValleSondondoDbContext(optionsBuilder.Options);
    }
}
