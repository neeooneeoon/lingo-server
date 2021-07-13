<<<<<<< HEAD
import { ConfigsModule } from "@configs/configs.module";
import { BooksModule } from "@libs/books";
import { ProgressesModule } from "@libs/progresses";
import { UnitsModule } from "@libs/units/units.module";
import { WordsModule } from "@libs/words";
import { WorksModule } from "@libs/works";
import { Module } from "@nestjs/common";
import { GoogleModule } from "../google/google.module";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";

@Module({
    imports: [GoogleModule,
        ConfigsModule,
        WorksModule,
        BooksModule,
        UnitsModule,
        WordsModule,
        ProgressesModule
    ],
    providers: [ImportsService],
    controllers: [ImportsController],
    exports: [ImportsService]
=======
import { ConfigsModule } from '@configs/configs.module';
import { BooksModule } from '@libs/books';
import { ProgressesModule } from '@libs/progresses';
import { WorksModule } from '@libs/works';
import { Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [
    GoogleModule,
    ConfigsModule,
    WorksModule,
    BooksModule,
    ProgressesModule,
  ],
  providers: [ImportsService],
  controllers: [ImportsController],
  exports: [ImportsService],
>>>>>>> 7b264252a805eba2eebd43458261bc2be6f12fdb
})
export class ImportsModule {}
