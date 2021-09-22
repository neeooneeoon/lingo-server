import { GoogleSpreadsheetService } from '@google/services';
import fs from 'fs';
import md5 from 'md5';
import path from 'path';

export class UnitDemo {
  private readonly spreadsheetService: GoogleSpreadsheetService;

  constructor(_spreadsheetService: GoogleSpreadsheetService) {
    this.spreadsheetService = _spreadsheetService;
  }
  public async vocabularyWithoutSound(sheetName: string) {
    const rows = (await this.spreadsheetService.getSheet(sheetName)).slice(3);
    const filePath = path.join(__dirname, '../data/audioOfWords.txt');
    const audioFileNames = fs.readFileSync(filePath, 'utf8');
    const EXT_FILE = '.mp3';
    const words: Array<string> = [];
    rows.forEach((row) => {
      if (row && row[2]) {
        const word = row[2].replace('\n', '').trim();
        if (word) {
          const fileName = md5(word).concat(EXT_FILE);
          if (!audioFileNames.includes(fileName)) {
            words.push(word);
          }
        }
      }
    });
    return words;
  }
}
