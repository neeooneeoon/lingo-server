import { google } from 'googleapis';
import { JWT } from 'googleapis-common';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4';
import { GoogleAuth } from 'google-auth-library/build/src/auth/googleauth';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';

export class GoogleSpreadsheetService {
  private readonly spreadsheetId: string;
  private readonly sheetsV4: sheets_v4.Sheets;
  private readonly auth?: string | GoogleAuth | OAuth2Client;

  constructor(_spreadsheetId: string, _auth: JWT) {
    this.spreadsheetId = _spreadsheetId;
    this.auth = _auth;
    this.sheetsV4 = google.sheets({ version: 'v4', auth: this.auth });
  }

  public async getSheet(sheetName: string): Promise<Array<Array<string>>> {
    const res = await this.sheetsV4.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    });
    return res.data.values;
  }

  public async deleteSheets(sheetIds: Array<number>) {
    const request: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [],
      },
    };
    sheetIds.slice(1).forEach((element) => {
      request.requestBody.requests.push({
        deleteSheet: { sheetId: element },
      });
    });
    await this.sheetsV4.spreadsheets.batchUpdate(request);
  }

  public async getSheetIds() {
    return (
      await this.sheetsV4.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      })
    ).data.sheets.map(
      (value: sheets_v4.Schema$Sheet) => value.properties.sheetId,
    );
  }

  public async createSheets(listNames: Array<string>) {
    if (listNames?.length > 0) {
      const request: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [],
        },
      };
      listNames.forEach((element) => {
        request.requestBody.requests.push({
          addSheet: { properties: { title: element } },
        });
      });
      await this.sheetsV4.spreadsheets.batchUpdate(request);
    } else throw new Error('listNames can not be blank.');
  }

  public async clearAll(sheetName: string) {
    const param: sheets_v4.Params$Resource$Spreadsheets$Values$Clear = {
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    };
    await this.sheetsV4.spreadsheets.values.clear(param);
  }

  public async writeAll(sheetName: string, data: Array<Array<string>>) {
    if (sheetName.trim() || data?.length > 0) {
      const param: sheets_v4.Params$Resource$Spreadsheets$Values$Update = {
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}`,
        requestBody: {
          range: `${sheetName}`,
          values: data,
        },
        valueInputOption: 'USER_ENTERED',
      };
      await this.sheetsV4.spreadsheets.values.update(param);
    }
  }

  public async updateRange(data: sheets_v4.Schema$ValueRange[]) {
    const body: sheets_v4.Schema$BatchUpdateValuesRequest = {
      data,
      valueInputOption: 'USER_ENTERED',
    };
    await this.sheetsV4.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: body,
    });
  }
}
