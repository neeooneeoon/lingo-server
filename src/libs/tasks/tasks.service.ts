import { UsersService } from "@libs/users/providers/users.service";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression  } from "@nestjs/schedule";
import { map } from "rxjs/operators";

@Injectable()
export class TasksService {

    constructor(
        private usersService: UsersService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    changeStreakScore() {
        const users$ = this.usersService.getAllUsers();
        users$
        .pipe(
            map(users => {
                return users.map(user => {
                    return this.usersService.changeUserStreak(String(user._id));
                })
            })
        )
    }

}