import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DistractedSentence,
  DistractedSentenceDocument,
} from '@entities/distractedSentence.entity';
import { Model } from 'mongoose';

@Injectable()
export class DistractedSentenceService {
  constructor(
    @InjectModel(DistractedSentence.name)
    private distractedSentenceModel: Model<DistractedSentenceDocument>,
  ) {}
  // public async createDistractedSentence()
}
