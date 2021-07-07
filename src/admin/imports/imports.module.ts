import { Module } from "@nestjs/common";
import { GoogleModule } from "../google/google.module";
import { ImportsService } from "./imports.service";

@Module({
    imports: [GoogleModule],
    providers: [ImportsService],
    exports: [ImportsService]
})
export class ImportsModule { }