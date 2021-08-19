import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigsService } from '@configs';
import { WordInEvaluation } from '@utils/types';
import { SaveLessonDto } from '@dto/user';
import { WordsService } from '@libs/words/words.service';

@Injectable()
export class EvaluationService {
  private fireStore: FirebaseFirestore.Firestore;

  constructor(
    private configService: ConfigsService,
    private wordsService: WordsService,
  ) {
    this.fireStore = new admin.firestore.Firestore({
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      credentials: {
        client_email: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        private_key: this.configService.get('FIREBASE_PRIVATE_KEY'),
      },
    });
  }

  public async addWord(userId: string, lessonResults: SaveLessonDto) {
    try {
      const evaluateWords = await this.wordsService.getWordsByUserResults(
        lessonResults,
      );
      const batch = this.fireStore.batch();
      const wordRef = this.fireStore
        .collection('words')
        .doc(userId) as FirebaseFirestore.DocumentReference<{
        [key: string]: WordInEvaluation;
      }>;
      const fieldValue = admin.firestore.FieldValue;
      evaluateWords.forEach((item) => {
        batch.set(
          wordRef,
          {
            [`${item._id}`]: {
              id: item._id,
              content: item.content,
              meaning: item.meaning,
              imageRoot: item.imageRoot,
              codes: fieldValue.arrayUnion(...item.codes),
              proficiency: fieldValue.increment(item.codes.length),
              bookId: item.bookId,
              unitId: item.unitId,
              level: item.level,
            },
          },
          { merge: true },
        );
      });
      await batch.commit();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
