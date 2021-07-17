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
      this.backupModel.create({
        ...data,
      }),
    );
  }
  public getNewSentencesFromBackup() {
    return from(this.backupModel.find()).pipe(map((sentences) => sentences));
  }
  public restoreSentences() {
    const sentences$ = this.getNewSentencesFromBackup();
    const result$ = sentences$.pipe(
      map((sentences) => {
        const sentenceRawDocs: RestoreSentenceDto[] = [];
        const backupQuestionInput: BackupQuestionInputDto = {};
        sentences.map((sentence) => {
          if (sentence.newInstance)
            sentenceRawDocs.push({
              audio: sentence.audio,
              content: sentence.content,
              meaning: sentence.meaning,
              _id: sentence.choiceId,
            });
          const path = `${sentence.bookId}/${sentence.unitId}/${sentence.levelIndex}`;
          const choice =
            sentence.code === QuestionTypeCode.S7
              ? sentence.content
              : sentence.choiceId;
          backupQuestionInput[path]
            ? backupQuestionInput[path].push({
                choiceId: choice,
                code: sentence.code,
                focusId: sentence.focusId,
              })
            : (backupQuestionInput[path] = [
                {
                  choiceId: sentence.choiceId,
                  code: sentence.code,
                  focusId: sentence.focusId,
                },
              ]);
        });
        return { sentenceRawDocs, backupQuestionInput };
      }),
      switchMap(({ sentenceRawDocs, backupQuestionInput }) => {
        return forkJoin([
          this.sentencesService.restoreSentences(sentenceRawDocs),
          this.questionsService.restoreChoice(backupQuestionInput),
        ]);
      }),
    );
    return result$;
  }
}
