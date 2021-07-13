import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4';
import { booksName } from '@utils/constants';
import * as googleKey from '@utils/keys/googleOauth.key.json';
import { JWT } from 'googleapis-common';
@Injectable()
export class GoogleService {
  public async createSheets(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
  ): Promise<void> {
    const request: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [],
      },
    };
    for (const bookName of booksName) {
      request.requestBody.requests.push({
        addSheet: { properties: { title: bookName } },
      });
    }
    await sheets.spreadsheets.batchUpdate(request);
  }
  public async updateSheet(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,
    data: string[][],
  ): Promise<void> {
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Update = {
      spreadsheetId: spreadsheetId,
      range: `${sheetName}`,
      requestBody: {
        range: `${sheetName}`,
        values: data,
      },
      valueInputOption: 'USER_ENTERED',
    };
    await sheets.spreadsheets.values.update(request);
  }
  public async clearSheets(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,
  ): Promise<void> {
    const request = {
      spreadsheetId: spreadsheetId,
      range: `${sheetName}`,
    };
    await sheets.spreadsheets.values.clear(request);
  }
  public async getSheet(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,
  ): Promise<string[][]> {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}`,
    });
    return res.data.values;
  }
  public async getSheetIds(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
  ): Promise<number[]> {
    return (
      await sheets.spreadsheets.get({ spreadsheetId: spreadsheetId })
    ).data.sheets.map(
      (value: sheets_v4.Schema$Sheet) => value.properties.sheetId,
    );
  }
  public async deleteDimension(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetId: number,
    dimension: string,
    startIndex: number,
  ): Promise<void> {
    const requests: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: dimension,
                startIndex: startIndex,
              },
            },
          },
        ],
      },
    };
    await sheets.spreadsheets.batchUpdate(requests);
  }
  public async autoResize(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetId: number,
    dimension: string,
  ): Promise<void> {
    const requests: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                dimension: dimension,
                sheetId: sheetId,
                startIndex: 0,
              },
            },
          },
        ],
      },
    };
    await sheets.spreadsheets.batchUpdate(requests);
  }

  public async hide(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetId: number,
    dimension: string,
    startIndex: number,
    endIndex: number,
  ): Promise<void> {
    const requests: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: dimension,
                startIndex: startIndex,
                endIndex: endIndex,
              },
              properties: {
                hiddenByUser: true,
              },
              fields: 'hiddenByUser',
            },
          },
        ],
      },
    };
    await sheets.spreadsheets.batchUpdate(requests);
  }
  public async Authorize(): Promise<JWT> {
    try {
      const client = new google.auth.JWT(
        googleKey.client_email,
        null,
        googleKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets'],
      );
      await client.authorize(async (err: Error, token: Credentials) => {
        if (err) {
          throw err;
        } else if (token) {
          console.log('Authorized');
        }
      });
      return client;
    } catch (e) {
      console.log(e);
    }
  }
}
