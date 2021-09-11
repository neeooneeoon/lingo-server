import { GoogleSpreadsheetService } from '@google/services';
import fs from 'fs';
import md5 from 'md5';
import path from 'path';

export class UnitDemo {
  private readonly spreadsheetService: GoogleSpreadsheetService;
  private readonly sheetName: string;

  constructor(
    _spreadsheetService: GoogleSpreadsheetService,
    _sheetName: string,
  ) {
    this.spreadsheetService = _spreadsheetService;
    this.sheetName = _sheetName;
  }
  public async vocabularyWithoutSound() {
    const rows = (await this.spreadsheetService.getSheet(this.sheetName)).slice(
      3,
    );
    const filePath = path.join(__dirname, '../data/audioOfWords.txt');
    const audioFileNames = fs.readFileSync(filePath, 'utf8');
    const EXT_FILE = '.mp3';
    rows.forEach((row) => {
      const word = row[2].replace('\n', '').trim();
      if (word) {
        const fileName = md5(word).concat(EXT_FILE);
        if (!audioFileNames.includes(fileName)) {
          console.log(word);
        }
      }
    });
  }
}
