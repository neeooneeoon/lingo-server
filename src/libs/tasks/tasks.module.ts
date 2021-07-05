import { UsersModule } from "@libs/users";
import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Module({
    imports: [
        UsersModule,
    ],
    providers: [TasksService],
})

export class TasksSModule { }