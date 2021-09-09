import { ConfigsService } from '@configs';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(private configsService: ConfigsService) {}
  public async createSession(): Promise<mongoose.ClientSession> {
    const uri = this.configsService.get('MONGODB_URI_LOCAL');
    const db = await mongoose.createConnection(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    return db.startSession();
  }
}
