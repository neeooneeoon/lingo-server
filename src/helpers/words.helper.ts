import { WordInLesson } from "@dto/word/wordInLesson.dto";
import { WordDocument } from "@entities/word.entity";

export class WordsHelper {

    public mapWordToWordInLesson (word: WordDocument): WordInLesson {
        return {
            _id: word._id,
            content: word.content,
            types: word.types,
            meaning: word.meaning,
            imageRoot: word.imageRoot,
        }
    }

}