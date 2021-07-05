import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression  } from "@nestjs/schedule";

@Injectable()
export class TasksService {

    private readonly logger = new Logger();

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    handleCron() {
        this.logger.debug('Called when the second is 45');
    }

}