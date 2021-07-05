import { ScoreStatisticSchema, ScoreStatistic } from "@entities/scoreStatistic.entity";
import { User, UserSchema } from "@entities/user.entity";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TasksService } from "./tasks.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: ScoreStatistic.name, schema: ScoreStatisticSchema},
        ])
    ],
    providers: [TasksService],
})

export class TasksSModule { }