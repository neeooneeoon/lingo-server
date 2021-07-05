import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Progress, ProgressSchema } from "@entities/progress.entity";
import { ProgressesService } from "./progresses.service";
import { ProgressesHelper } from '@helpers/progresses.helper';
import { ProgressesController } from "./progresses.controller";
import { BooksModule } from "@libs/books";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Progress.name,
                schema: ProgressSchema
            },
        ]),
        forwardRef(() => BooksModule),
    ],
    controllers: [
        ProgressesController,
    ],
    providers: [
        ProgressesService,
        ProgressesHelper,
    ],
    exports: [
        ProgressesService,
    ]
})
export class ProgressesModule { }