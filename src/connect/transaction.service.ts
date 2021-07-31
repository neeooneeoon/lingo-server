import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';

@Injectable()
export class TransactionService {
  public async createTransaction(): Promise<mongoose.ClientSession> {
    const db = await mongoose.createConnection(
      'mongodb://localhost:27017/tuvungtest',
      { useUnifiedTopology: true, useNewUrlParser: true },
    );
    return db.startSession();
  }
}
