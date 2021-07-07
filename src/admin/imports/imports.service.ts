import { GoogleService } from "@libs/users/providers/google.service";
import { Injectable } from "@nestjs/common";
import { Mongoose } from "mongoose";

@Injectable()
export class ImportsService {
    constructor(
        private googleService: GoogleService
    ) { }
    // public async importData(): Promise<void> {
    //     const client = await Authorize();
    //     const sheets = google.sheets({ version: "v4", auth: client });
    //     const bookRows = await getSheet(sheets, SMLING_DATA, "Books");
    //     const unitRows = await getSheet(sheets, SMLING_DATA, "Units");
    //     const books = await Books.findOne();
    //     if (books) {
    //         console.log("Drop Database");
    //         try {
    //             // await DBConnection.db.dropCollection("books");
                
    //             const userProgress = await Progresses.findOne();
    //             if (userProgress) await DBConnection.db.dropCollection("progresses");
    //             const userWork = await Works.findOne();
    //             if (userWork) await DBConnection.db.dropCollection("works");
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     await Books.find();
    //     const unitImagesResult = await unitImages()
    //     await importBook(bookRows);
    //     await importUnit(unitRows, unitImagesResult);
    //     console.log("Done");
    //     await DBConnection.close();
    // }).on("error", (error: Error) => {
    //     console.log(error);
    // });
    // }
}