import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('unread') unread?: string,
  ) {
    const userId = req.user.id;
    const userType = req.user.userType;
    const limitNum = limit ? parseInt(limit) : 50;

    if (unread === 'true') {
      return this.notificationsService.findUnreadByUser(userId, userType);
    }

    return this.notificationsService.findByUser(userId, userType, limitNum);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    const userType = req.user.userType;
    return this.notificationsService.countUnreadByUser(userId, userType);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const userType = req.user.userType;
    return this.notificationsService.markAsRead(id, userId, userType);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    const userType = req.user.userType;
    return this.notificationsService.markAllAsRead(userId, userType);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const userType = req.user.userType;
    return this.notificationsService.remove(id, userId, userType);
  }
}
