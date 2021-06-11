import { Module, Global } from '@nestjs/common';
import { ConfigsService } from './configs.service';

@Global()
@Module({
    providers: [
        {
            provide: ConfigsService,
            useValue: new ConfigsService()
        }
    ],
    exports: [ConfigsService],
})
export class ConfigsModule {}