import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AddWordDto } from '@dto/evaluation';
import { ConfigsService } from '@configs';
import { WordInEvaluation } from '@utils/types';

@Injectable()
export class EvaluationService {
  private fireStore: FirebaseFirestore.Firestore;

  constructor(private configService: ConfigsService) {
    this.fireStore = new admin.firestore.Firestore({
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      credentials: {
        client_email: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        private_key: this.configService.get('FIREBASE_PRIVATE_KEY'),
      },
    });
  }

  public async addWord(userId: string, inputs: AddWordDto[]) {
    try {
      inputs.push({
        id: 'string',
        codes: ['string'],
        content: 'string',
        meaning: 'string',
        imageRoot: '',
        proficiency: 0,
        bookId: 'string',
        unitId: 'string',
        level: 0,
      });
      const batch = this.fireStore.batch();
      const wordRef = this.fireStore
        .collection('words')
        .doc(userId) as FirebaseFirestore.DocumentReference<{
        [key: string]: WordInEvaluation;
      }>;
      const fieldValue = admin.firestore.FieldValue;
      inputs.forEach((body) => {
        batch.set(
          wordRef,
          {
            [`${body.id}`]: {
              content: body.content,
              codes: fieldValue.arrayUnion(...body.codes),
              meaning: body.meaning,
              imageRoot: body.imageRoot,
              proficiency: fieldValue.increment(body.codes.length),
              bookId: body.bookId,
              unitId: body.unitId,
              level: body.level,
              id: body.id,
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
