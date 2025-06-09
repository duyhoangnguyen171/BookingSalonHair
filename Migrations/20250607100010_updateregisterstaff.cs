using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookingSalonHair.Migrations
{
    /// <inheritdoc />
    public partial class updateregisterstaff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "TimeSlots",
                newName: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSlots_StaffId",
                table: "TimeSlots",
                column: "StaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSlots_Users_StaffId",
                table: "TimeSlots",
                column: "StaffId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSlots_Users_StaffId",
                table: "TimeSlots");

            migrationBuilder.DropIndex(
                name: "IX_TimeSlots_StaffId",
                table: "TimeSlots");

            migrationBuilder.RenameColumn(
                name: "StaffId",
                table: "TimeSlots",
                newName: "UserId");
        }
    }
}
