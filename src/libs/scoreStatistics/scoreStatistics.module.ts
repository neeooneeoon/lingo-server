import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@libs/users";
import { ScoreStatistic, ScoreStatisticSchema } from "@entities/scoreStatistic.entity";
import { ScoreStatisticsService } from "./scoreStatistics.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: ScoreStatistic.name, schema: ScoreStatisticSchema},
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
