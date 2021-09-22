import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '@lingo/tools/src/google/services';
import fs from 'fs';
import path from 'path';
import https from 'https';
import md5 from 'md5';

const download = async () => {
  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(
    '1GI8UHxNSt0-sPlq_u0lkW3cOnrfgR78vuTml78e_Pnw',
    auth,
  );

  const rows = await spreadsheetService.getSheet('Từ Thiếu Âm Thanh');
  for (const row of rows) {
    const url = row[1].replace(/[\n]/g, '').trim();
    const content = row[0].replace(/[\n]/g, '').trim();
    if (url && content) {
      fs.appendFile(
        path.join(__dirname, '../exports/data/audioOfWords.txt'),
        md5(content).concat('.mp3\n'),
        (err) => {
          if (err) throw err;
        },
      );
    }
  }
};

download();
