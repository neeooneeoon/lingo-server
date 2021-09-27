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

  const rows = [
    [
      'Ca',
      'https://cauhoi-api.sachmem.vn/api/media/1hHAXcNR7Vl62-SE27R0VItx-iPRN_tWOEIlklcMMVFY_TA_Lop7_moi/42_43.mp3',
    ],
    [
      'Be',
      'https://cauhoi-api.sachmem.vn/api/media/1hHAXcNR7Vl62-SE27R0VItx-iPRN_tWOEIlklcMMVFY_TA_Lop7_moi/43_44.mp3',
    ],
  ];
  for (const row of rows) {
    const url = row[1].replace(/[\n]/g, '').trim();
    const content = row[0].replace(/[\n]/g, '').trim();
    https.get(url, (res) => {
      const file = fs.createWriteStream(
        path.join(__dirname, 'audios', md5(content).concat('.mp3')),
      );
      res.pipe(file);
    });
    if (url && content) {
      fs.appendFile(
        path.join(__dirname, '../exports/data/dict2Audio.txt'),
        md5(content).concat('.mp3\n'),
        (err) => {
          if (err) throw err;
        },
      );
    }
  }
};

download();
