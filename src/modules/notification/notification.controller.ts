import { Controller, Get, Put, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean })
  findAll(@CurrentUser('userId') userId: number, @Query('unread') unread?: string) {
    return this.notificationService.findAll(userId, unread === 'true');
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser('userId') userId: number) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser('userId') userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }
}
