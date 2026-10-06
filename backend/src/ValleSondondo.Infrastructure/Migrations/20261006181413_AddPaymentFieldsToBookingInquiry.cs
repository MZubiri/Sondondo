using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ValleSondondo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentFieldsToBookingInquiry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                table: "BookingInquiries",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "BookingInquiries",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PaymentReceiptUrl",
                table: "BookingInquiries",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "BookingInquiries",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "BookingInquiries",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VoucherCode",
                table: "BookingInquiries",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaidAmount",
                table: "BookingInquiries");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "BookingInquiries");

            migrationBuilder.DropColumn(
                name: "PaymentReceiptUrl",
                table: "BookingInquiries");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "BookingInquiries");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "BookingInquiries");

            migrationBuilder.DropColumn(
                name: "VoucherCode",
                table: "BookingInquiries");
        }
    }
}
