import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';

@Module({
  imports: [],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}
