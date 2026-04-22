import { Controller, Get, Patch, Body, UseGuards, Post, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.userService.findOne(user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: any, @Body() updateData: Partial<User>) {
    return this.userService.updateProfile(user.userId, updateData);
  }

  @Post('cnic/:side')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload CNIC photo (side: front or back)' })
  uploadCnic(
    @CurrentUser() user: any,
    @Param('side') side: 'front' | 'back',
    @Body('photo') base64: string,
  ) {
    return this.userService.uploadCnic(user.userId, side, base64);
  }
}
