import { UsersService } from "@libs/users/providers/users.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression  } from "@nestjs/schedule";
import { ScoreStatisticsService } from "@libs/scoreStatistics/scoreStatistics.service";

@Injectable()
export class TasksService {

    private readonly logger = new Logger();

    constructor(
        private usersService: UsersService,
        private scoreStatisticService: ScoreStatisticsService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    handleCron() {
        this.logger.debug('Called when the second is 45');
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    changeStreakScore() {

    }

}