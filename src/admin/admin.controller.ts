import { AdminLoginDto } from '@dto/admin';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin Login' })
  @ApiBody({ type: AdminLoginDto, required: true })
  adminLogin(@Body() body: AdminLoginDto) {
    return this.adminService.login(body.email, body.password);
  }
}
