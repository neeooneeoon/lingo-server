import { Model } from 'mongoose';
import { Progress, ProgressDocument } from "@entities/progress.entity";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserProgressDto } from '@dto/progress/createProgress.dto';

@Injectable()
export class ProgressesService {
    constructor(
        @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,

    ) { }

    async createUserProgress(input: CreateUserProgressDto): Promise<ProgressDocument> {
        const { userId, books } = input;
        return this.progressModel.create({
            userId: userId,
            books: books,
        });
    }
}