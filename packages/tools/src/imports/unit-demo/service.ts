import { GoogleSpreadsheetService } from '@lingo/tools/src/google/services';
import {
  NewBookDemo,
  WordInSheet,
  SentenceInSheet,
  ContentSplitType,
  TranslateSplitType,
  SpreadsheetAnalysisParam,
} from '../types';
import { extendedWords, wordClassification } from '@lingo/tools/src/helpers';
import md5 from 'md5';

type SpreadsheetResponse = WordInSheet[] | SentenceInSheet[];

export class UnitDemoService {
  private readonly spreadsheetService: GoogleSpreadsheetService;

  constructor(_spreadsheetService) {
    this.spreadsheetService = _spreadsheetService;
  }

  public async spreadsheetAnalysis(
    param: SpreadsheetAnalysisParam,
  ): Promise<SpreadsheetResponse[]> {
    try {
      const TITLE_END_POSITION = 3;
      const rows = await this.spreadsheetService.getSheet(param.sheetName);
      const usefulRows = rows.slice(TITLE_END_POSITION);

      if (usefulRows?.length > 0) {
        const words: WordInSheet[] = [];
        const sentences: SentenceInSheet[] = [];

        usefulRows.forEach((row) => {
          if (row[2]) {
            const regex = new RegExp(
              /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\~\_\n\ ]/g,
            );
            const formattedWord = row[2]
              .trim()
              .replace('\n', '')
              .normalize('NFKD');
            const formattedMeaning = row[6]
              .trim()
              .replace('\n', '')
              .normalize('NFKD');
            const signature = row[3]?.toUpperCase()?.trim()?.replace(regex, '');
            const classify = signature && wordClassification(signature);
            const wordId = `${param.imageRoot}-${md5(
              row[2].replace('\n', ''),
            )}`;

            words.push({
              _id: wordId,
              meanings: [formattedMeaning],
              pronunciations: [row[5].replace('\n', '')],
              types: classify ? [classify] : [],
              haveImageWords: [],
              noImageWords: [],
              bookNId: param.bookNId,
              unitNId: param.unitNId,
              content: formattedWord,
              meaning: formattedMeaning,
              imageRoot: param.imageRoot,
              isUseToMakeQuestion: true,
            });
          }
        });
        return [words, sentences];
      } else {
        throw new Error('No useful data found');
      }
    } catch (error) {
      throw error;
    }
  }
}
