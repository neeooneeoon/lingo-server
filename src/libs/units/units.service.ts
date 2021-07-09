import { GoogleService } from "@admin/google/google.service";
import { Unit } from "@dto/unit/unit.dto";  
import { BookDocument, Book } from "@entities/book.entity";
import { BooksHelper } from "@helpers/books.helper";
import { BooksService } from "@libs/books/providers/books.service";
import { SentencesService } from "@libs/sentences/sentences.service";
import { WordsService } from "@libs/words/words.service";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { google } from "googleapis";
import { Model } from "mongoose";

export type ImageResult = {
    [key: number]: any[]
}
@Injectable()
export class UnitsService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<BookDocument>,
        private booksHelper: BooksHelper, 
        private booksService: BooksService,
        private googleService: GoogleService,
        private wordsService: WordsService,
        private sentencesService: SentencesService
        
    ) { }
    
    public async unitImages(): Promise<ImageResult> {
        const workSheet = "UnitImages";
    
        const client = await this.googleService.Authorize();
        const sheets = google.sheets({ version: "v4", auth: client });
    
        const getWorkSheet = await this.googleService.getSheet(sheets, process.env.REPORT_SHEET, workSheet);
        let result: ImageResult = {};
        const deepRegex = new RegExp(/[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\~\`\_\?\,\”\’\‘\“\"\’\'\ ]/g);
        for (let i = 1; i < getWorkSheet.length; i++) {
            const row = getWorkSheet[i];
            const inspectedBookNId = Number(row[5]);
            const [normalFileName, normalFilExt] = row[1].split('.');
            const [blueFileName, blueFileExt] = row[2].split('.');
            const normalImage = normalFileName.replace(deepRegex, '').concat('.svg').toLowerCase();
            const blueImage = blueFileName.replace(deepRegex, '').concat('.svg').toLowerCase();
            const unitName = row[3].trim();
            const unitId = this.booksHelper.getID(unitName);
    
            result[inspectedBookNId] = result[inspectedBookNId] ? [
                ...result[inspectedBookNId],
                {
                    id: unitId,
                    name: unitName,
                    blue: blueImage,
                    normal: normalImage
                }
            ] : [{
                id: unitId,
                name: unitName,
                blue: blueImage,
                normal: normalImage
            }]
        }
        return result;
    }
    

    public async importUnit(rows: string[][], images: ImageResult): Promise<void> {
        let j = 1;
        let temp = 0;
        for (let i = 1; i < rows.length; i++) {
            const bookNId = Number(rows[i][2]);
            //const bookId = this.booksHelper.getID(rows[i][3]).trim();
            const bookName = rows[i][3].trim();
            const unitNId = Number(rows[i][1]);
            if (bookNId == 1 || bookNId == 3) {
                continue;
            }
            const _id = this.booksHelper.getID(rows[i][4]);

            if (bookNId % 2 == 0 && temp !== bookNId) {
                j = 1;
                temp = bookNId;
            }
            const wordSentencePromises = await Promise.all([
                this.wordsService.getWordsInUnit(bookNId, unitNId),
                this.sentencesService.getSentencesInUnit(bookNId, unitNId)
            ]);
            const wordsInUnit = wordSentencePromises[0];
            const sentencesInUnit = wordSentencePromises[1];
            const wordsSize = wordsInUnit.length;
            const unitImages = images[bookNId].find(item => item.id == _id);
            const prefixNormal = `https://s.saokhuee.com/lingo/anhunit/${bookName}/normal/`;
            const prefixBlue = `https://s.saokhuee.com/lingo/anhunit/${bookName}/blue/`;
            if (wordsSize < 12) {
                const unit: Unit = {
                    _id: _id,
                    nId: Number(rows[i][1]) * 100,
                    unitIndex: Number(rows[i][7]) * 100,
                    key: rows[i][0],
                    name: `U${j}. ${rows[i][4]}`,
                    description: rows[i][3],
                    grammar: rows[i][5],
                    tips: rows[i][6],
                    wordIds: wordsInUnit.map((w) => w._id),
                    sentenceIds: sentencesInUnit.map((s) => s._id),
                    normalImage: unitImages && unitImages?.normal ? prefixNormal + unitImages.normal : '',
                    blueImage: unitImages && unitImages?.blue ? prefixBlue + unitImages.blue : '',
                    levels: [],
                    totalLessons: 0,
                    totalQuestions: 0,
                    totalLevels: 0
                };
                await Promise.all([
                    this.wordsService.updateWords(bookNId, unitNId),
                    this.sentencesService.updateSentences(bookNId, unitNId),
                    this.booksService.updateBook(Number(rows[i][2]), unit)
                ]);
            }
            else if (wordsSize >= 12 && wordsSize < 16) {
                const ranges = this.booksHelper.divideRange(wordsSize, 6);
                const units = await this.booksService.mapRangeToWords(
                    wordsInUnit,
                    sentencesInUnit,
                    ranges,
                    6,
                    rows[i],
                    j,
                    unitImages,
                    bookName
                );
                // await Books.updateOne(
                //     { nId: Number(rows[i][2]) },
                //     {
                //         $inc: { totalUnits: units.length },
                //         $push: { units: { $each: units } },
                //     }
                // );
                await this.booksService.updateBook(Number(rows[i][2]), units);
            }
            else {
                const ranges = this.booksHelper.divideRange(wordsSize, 8);
                const units = await this.booksService.mapRangeToWords(
                    wordsInUnit,
                    sentencesInUnit,
                    ranges,
                    8,
                    rows[i],
                    j,
                    unitImages,
                    bookName
                );
                await this.booksService.updateBook(Number(rows[i][2]), units);
                // await Books.updateOne(
                //     { nId: Number(rows[i][2]) },
                //     {
                //         $inc: { totalUnits: units.length },
                //         $push: { units: { $each: units } },
                //     }
                // );
            }
            j++;
        }
    }
}