using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookingSalonHair.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffTimeSlotTable_Fixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSlots_Users_StaffId",
                table: "TimeSlots");

            migrationBuilder.DropForeignKey(
                name: "FK_TimeSlots_WorkShifts_WorkShiftId",
                table: "TimeSlots");

            migrationBuilder.DropIndex(
                name: "IX_TimeSlots_StaffId",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "StaffId",
                table: "TimeSlots");

            migrationBuilder.CreateTable(
                name: "StaffTimeSlots",
                columns: table => new
                {
                    StaffId = table.Column<int>(type: "int", nullable: false),
                    TimeSlotId = table.Column<int>(type: "int", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false),
                    WorkShiftId = table.Column<int>(type: "int", nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffTimeSlots", x => new { x.StaffId, x.TimeSlotId });
                    table.ForeignKey(
                        name: "FK_StaffTimeSlots_TimeSlots_TimeSlotId",
                        column: x => x.TimeSlotId,
                        principalTable: "TimeSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffTimeSlots_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffTimeSlots_WorkShifts_WorkShiftId",
                        column: x => x.WorkShiftId,
                        principalTable: "WorkShifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StaffTimeSlots_TimeSlotId",
                table: "StaffTimeSlots",
                column: "TimeSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffTimeSlots_WorkShiftId",
                table: "StaffTimeSlots",
                column: "WorkShiftId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSlots_WorkShifts_WorkShiftId",
                table: "TimeSlots",
                column: "WorkShiftId",
                principalTable: "WorkShifts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSlots_WorkShifts_WorkShiftId",
                table: "TimeSlots");

            migrationBuilder.DropTable(
                name: "StaffTimeSlots");

            migrationBuilder.AddColumn<int>(
                name: "StaffId",
                table: "TimeSlots",
                type: "int",
                nullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSlots_WorkShifts_WorkShiftId",
                table: "TimeSlots",
                column: "WorkShiftId",
                principalTable: "WorkShifts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
