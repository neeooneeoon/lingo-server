import { GoogleSpreadsheetService } from '@google/services';

export class UnitDemo {
  private spreadsheetService: GoogleSpreadsheetService;
  private sheetName: string;

  constructor(
    _spreadsheetService: GoogleSpreadsheetService,
    _sheetName: string,
  ) {
    this.spreadsheetService = _spreadsheetService;
    this.sheetName = _sheetName;
  }
  public async vocabularyWithoutSound() {
    const rows = await this.spreadsheetService.getSheet(this.sheetName);
    console.log(rows);
  }
}
