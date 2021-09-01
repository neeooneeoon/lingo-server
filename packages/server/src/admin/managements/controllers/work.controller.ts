import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { WorksService } from '@libs/works/works.service';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { Controller, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('api/admin/works')
@ApiBearerAuth()
@ApiTags('Admin')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class WorkManagementController {
  constructor(private readonly worksService: WorksService) {}

  @Delete('rollbackBooks')
  rollbackBooks() {
    return this.worksService.rollbackBooks();
  }
}
