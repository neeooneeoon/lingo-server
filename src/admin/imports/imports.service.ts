import { ConfigsService } from '@configs/configs.service';
import { GoogleService } from '@admin/google/google.service';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as mongoose from 'mongoose';
import { BooksService } from '@libs/books/providers/books.service';
import { WorksService } from '@libs/works/works.service';
import { ProgressesService } from '@libs/progresses/progresses.service';

@Injectable()
export class ImportsService {
  constructor(
    private googleService: GoogleService,
    private configsService: ConfigsService,
    private booksService: BooksService,
    private worksService: WorksService,
    private progressesService: ProgressesService,
  ) {}
  public async importData(): Promise<void> {
    const mongoConfig = this.configsService.getMongoConfig();
    const { uri, ...option } = mongoConfig;
    const mg = await mongoose.connect(mongoConfig.uri, option);

    const client = await this.googleService.Authorize();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const bookRows = await this.googleService.getSheet(
      sheets,
      process.env.SMILING_DATA,
      'Books',
    );
    const unitRows = await this.googleService.getSheet(
      sheets,
      process.env.SMLING_DATA,
      'Units',
    );
    if (this.booksService.isExist()) {
      console.log('Drop Database');
      try {
        this.dropColl(mg.connection, 'books');
        const promises = await Promise.all([
          this.progressesService.isExist(),
          this.worksService.isExist(),
        ]);
        if (promises[0]) this.dropColl(mg.connection, 'progresses');
        if (promises[1]) this.dropColl(mg.connection, 'works');
      } catch (error) {
        console.log(error);
      }
    }
    await this.booksService.isExist();
    // const unitImagesResult = await unitImages();
    // await this.booksService.importBook(bookRows);
    // await importUnit(unitRows, unitImagesResult);
    console.log('Done');
  }

  private dropColl(conn: mongoose.Connection, name: string): void {
    conn.db.dropCollection(name, function (err, result) {
      if (err) console.log('err', err);
      if (result) console.log('result', result);
    });
  }
}
