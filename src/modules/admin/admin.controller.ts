import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminUserFilterDto, VerifyCnicDto, BlockUserDto, ResolveDisputeDto } from './dto/admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get users with filters' })
  getUsers(@Query() filter: AdminUserFilterDto) {
    return this.adminService.getUsers(filter);
  }

  @Put('users/:userId/verify-cnic')
  @ApiOperation({ summary: 'Verify user CNIC' })
  verifyCnic(@Param('userId', ParseIntPipe) userId: number, @Body() dto: VerifyCnicDto) {
    return this.adminService.verifyCnic(userId, dto.verified);
  }

  @Put('users/:userId/block')
  @ApiOperation({ summary: 'Block/Unblock user' })
  blockUser(@Param('userId', ParseIntPipe) userId: number, @Body() dto: BlockUserDto) {
    return this.adminService.blockUser(userId, dto.blocked);
  }

  @Get('vehicles/unverified')
  @ApiOperation({ summary: 'Get unverified vehicles' })
  getUnverifiedVehicles() {
    return this.adminService.getUnverifiedVehicles();
  }

  @Put('vehicles/:vehicleId/verify')
  @ApiOperation({ summary: 'Verify vehicle' })
  verifyVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.adminService.verifyVehicle(vehicleId);
  }

  @Get('trips')
  @ApiOperation({ summary: 'Get all trips' })
  getTrips(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getTrips(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('disputes')
  @ApiOperation({ summary: 'Get disputes' })
  getDisputes() {
    return this.adminService.getDisputes();
  }

  @Post('disputes/:bookingId/resolve')
  @ApiOperation({ summary: 'Resolve dispute' })
  resolveDispute(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.adminService.resolveDispute(bookingId);
  }
}
