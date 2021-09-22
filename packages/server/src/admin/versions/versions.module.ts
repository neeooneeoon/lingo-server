import { CacheModule } from '@cache';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Version, VersionSchema } from '@entities/version.entity';
import { VersionsController } from '@admin/versions/versions.controller';
import { VersionsService } from '@admin/versions/versions.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Version.name, schema: VersionSchema }]),
    CacheModule,
  ],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
