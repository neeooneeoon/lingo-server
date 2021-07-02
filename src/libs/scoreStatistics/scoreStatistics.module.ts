import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@libs/users";
import { ScoreStatistic, ScoreStatisticShema } from "@entities/scoreStatistic.entity";
import { ScoreStatisticsService } from "./scoreStatistics.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: ScoreStatistic.name, schema: ScoreStatisticShema},
        ]),
        forwardRef(() => UsersModule)
    ],
    providers: [
        ScoreStatisticsService
    ],
    exports: [
        ScoreStatisticsService
    ]
})
export class ScoreStatisticsModule {}
