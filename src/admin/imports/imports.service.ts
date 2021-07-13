import { ConfigsService } from '@configs/configs.service';
import { GoogleService } from '@admin/google/google.service';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as mongoose from 'mongoose';
<<<<<<< HEAD
import { BooksService } from "@libs/books/providers/books.service";
import { WorksService } from "@libs/works/works.service";
import { ProgressesService } from "@libs/progresses/progresses.service";
import { UnitsService } from "@libs/units/units.service";
import { WordsService } from "@libs/words/words.service";
import { booksName } from "@utils/constants";

@Injectable()
export class ImportsService {
    constructor(
        private googleService: GoogleService,
        private configsService: ConfigsService,
        private booksService: BooksService,
        private worksService: WorksService,
        private progressesService: ProgressesService,
        private unitsService: UnitsService,
        private wordsService: WordsService
    ) { }
    public async importBooksData(): Promise<void> {
        const mongoConfig = this.configsService.getMongoConfig();
        const { uri, ...option } = mongoConfig;
        const mg = await mongoose.connect(mongoConfig.uri, option);
        const conn = mg.connection;
        const client = await this.googleService.Authorize();
        const sheets = google.sheets({ version: "v4", auth: client });
        const bookRows = await this.googleService.getSheet(sheets, process.env.SMLING_DATA, "Books");
        const unitRows = await this.googleService.getSheet(sheets, process.env.SMLING_DATA, "Units");
        if (this.booksService.isExist()) {
            console.log("Drop Database");
            try {
                this.dropCollection(conn, 'books')
                const promises = await Promise.all([
                    this.progressesService.isExist(),
                    this.worksService.isExist()
                ]);
                if (promises[0]) this.dropCollection(conn, 'progresses');
                if (promises[1]) this.dropCollection(conn, 'works');
            } catch (error) {
                console.log(error);
            }
        }
        await this.booksService.isExist();
        const unitImagesResult = await this.unitsService.unitImages();
         await this.booksService.importBook(bookRows);
         await this.unitsService.importUnit(unitRows, unitImagesResult);
        conn.close();
        console.log("Done");
    }
    public async importWordsData(): Promise<void> {
        const mongoConfig = this.configsService.getMongoConfig();
        const { uri, ...option } = mongoConfig;
        const mg = await mongoose.connect(mongoConfig.uri, option);
        const conn = mg.connection;
        const client = await this.googleService.Authorize();
        const sheets = google.sheets({ version: "v4", auth: client });
        //const words = await Words.find();
        if (await this.wordsService.isExist()) {
            this.dropCollection(conn, 'words');
        //   await DBConnection.db.dropCollection("words");
        }
        await this.wordsService.isExist();
        console.log("Import Word");
      
        for (const bookName of booksName) {
          const rows = await this.googleService.getSheet(sheets, process.env.SMLING_DATA, bookName);
          await this.wordsService.importWord(rows);
        }
        const wordExtend = await this.googleService.getSheet(sheets, process.env.WORD_EXTEND, "words");
        await this.wordsService.importExtend(wordExtend);
        conn.close();
        console.log("Done");
    }
    private dropCollection(conn: mongoose.Connection, name: string): void {
        conn.db.dropCollection(name, function (err, result) {
            if (err) console.log("err", err);
            if (result) console.log("result", result);
        });
    }


}
=======
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
>>>>>>> 7b264252a805eba2eebd43458261bc2be6f12fdb
