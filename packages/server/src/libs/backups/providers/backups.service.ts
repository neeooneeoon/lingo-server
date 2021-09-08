import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Backup, BackupDocument } from '@entities/backup.entity';
import { Model } from 'mongoose';
import {
  BackupDto,
  BackupQuestionInputDto,
  RestoreSentenceDto,
} from '@dto/backup';
import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SentencesService } from '@libs/sentences/sentences.service';
import { QuestionHoldersService } from '@libs/questionHolders/providers/questionHolders.service';
import { QuestionTypeCode } from '@utils/enums';

@Injectable()
export class BackupsService {
  constructor(
    @InjectModel(Backup.name) private backupModel: Model<BackupDocument>,
    private readonly sentencesService: SentencesService,
    private readonly questionsService: QuestionHoldersService,
  ) {}
  public restore(data: BackupDto): Observable<BackupDocument> {
    return from(
      this.backupModel.findOne({
        bookId: data.bookId,
        unitId: data.unitId,
        levelIndex: Number(data.levelIndex),
        focusId: data.focusId,
        code: data.code,
        choiceId: data.choiceId,
      }),
    ).pipe(
      switchMap((backup) => {
        if (backup) {
          return this.backupModel.findOneAndUpdate(
            {
              bookId: data.bookId,
              unitId: data.unitId,
              levelIndex: Number(data.levelIndex),
              focusId: data.focusId,
              code: data.code,
              choiceId: data.choiceId,
            },
            {
              $set: {
                active: data.active,
              },
            },
            {
              new: true,
            },
          );
        } else {
          return from(
            this.backupModel.create({
              ...data,
            }),
          );
        }
      }),
    );
  }
  public getNewSentencesFromBackup() {
    return from(this.backupModel.find()).pipe(map((sentences) => sentences));
  }

  public restoreChoicesFromBackup() {
    return from(this.backupModel.find().lean()).pipe(
      map((docs) => {
        const newSentences: RestoreSentenceDto[] = [];
        const backupQuestionInput: BackupQuestionInputDto = {};
        docs.forEach((element) => {
          if (element.newInstance) {
            newSentences.push({
              audio: element.audio,
              content: element.content,
              meaning: element.meaning,
              _id: element.choiceId,
              active: element.active,
            });
          }
          const path = `${element.bookId}/${element.unitId}`;
          const backupChoice =
            element.code === QuestionTypeCode.S7
              ? element.content
              : element.choiceId;
          backupQuestionInput[path]
            ? backupQuestionInput[path].push({
                choiceId: backupChoice,
                code: element.code,
                focusId: element.focusId,
                active: element.active,
              })
            : (backupQuestionInput[path] = [
                {
                  choiceId: backupChoice,
                  code: element.code,
                  focusId: element.focusId,
                  active: element.active,
                },
              ]);
        });
        return { newSentences, backupQuestionInput };
      }),
      switchMap(({ newSentences, backupQuestionInput }) => {
        return forkJoin([
          this.sentencesService.restoreSentences(newSentences),
          this.questionsService.changeChoicesInQuestion(backupQuestionInput),
        ]);
      }),
    );
  }
}
