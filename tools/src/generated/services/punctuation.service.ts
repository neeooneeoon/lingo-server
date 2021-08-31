import { Sentence } from '@entities/sentence.entity';
import * as stringSimilarity from 'string-similarity';
import { Rating } from 'string-similarity';
import {
  SentenceSimilarity,
  SimpleStory,
  StorySimilarity,
} from 'tools/src/generated/types';
import * as stories from 'tools/src/generated/data/sentencesFromStories.json';
import { Collection } from 'mongodb';

export class PunctuationService {
  private readonly punctuationSet: Set<string>;
  private readonly focusSentence: Sentence;

  constructor(__punctuations: Array<string>, _focusSentence: Sentence) {
    this.punctuationSet = new Set(__punctuations);
    this.focusSentence = _focusSentence;
  }

  private containPunctuations(otherContent: string): boolean {
    const allPunctuations = ['“', '”', '"', '’', "'", '!', ',', '?', '.'];
    let matchAll = true;
    for (const p of allPunctuations) {
      const punctuationIndex = otherContent.indexOf(p);
      if (punctuationIndex === -1) {
        if (this.punctuationSet.has(p)) {
          matchAll = false;
          break;
        }
      } else {
        if (!this.punctuationSet.has(p)) {
          matchAll = false;
          break;
        }
      }
    }
    return matchAll;
  }

  private static compareBaseSimilarityRate(a: Rating, b: Rating) {
    if (a.rating > b.rating) {
      return -1;
    } else if (a.rating < b.rating) {
      return -1;
    } else {
      return 0;
    }
  }

  private findBestMatchSentences(
    content: string,
    listContents: Array<string>,
    matchedSentences: Sentence[],
  ): Array<string> {
    const choices: Array<string> = [];
    const { ratings } = stringSimilarity.findBestMatch(content, listContents);
    const ratingsLength = ratings.length;
    const listSimilarity: SentenceSimilarity[] = [];
    for (let i = 0; i < ratingsLength; i++) {
      const extractSentence = matchedSentences[i];
      listSimilarity.push({
        ...ratings[i],
        _id: extractSentence._id,
        unitNId: extractSentence.unitNId,
        bookNId: extractSentence.unitNId,
      });
    }
    const similaritySentencesPrev = listSimilarity.filter(
      (item) =>
        (item.bookNId == this.focusSentence.bookNId &&
          item.unitNId <= this.focusSentence.unitNId) ||
        item.bookNId < this.focusSentence.bookNId,
    );
    if (similaritySentencesPrev.length > 0) {
      similaritySentencesPrev
        .sort(PunctuationService.compareBaseSimilarityRate)
        .slice(0, 5)
        .map((item) => {
          if (item?._id) {
            choices.push(item._id);
          }
        });
    }
    if (choices.length == 0) {
      const similaritySentencesPost = listSimilarity.filter(
        (item) =>
          (item.bookNId == this.focusSentence.bookNId &&
            item.unitNId > this.focusSentence.unitNId) ||
          item.bookNId > this.focusSentence.bookNId,
      );
      if (similaritySentencesPost.length > 0) {
        similaritySentencesPost.slice(0, 5).map((item) => {
          if (item?._id) {
            choices.push(item._id);
          }
        });
      }
    }
    return choices;
  }

  private async findBestMatchStories(
    content: string,
    listContents: Array<string>,
    listStories: SimpleStory[],
    sentences: Collection<Sentence>,
  ) {
    const choices: Array<string> = [];
    const { ratings } = stringSimilarity.findBestMatch(content, listContents);

    if (ratings?.length > 0) {
      const storySimilarity: StorySimilarity[] = ratings
        .map((el, i) => {
          return {
            ...el,
            _id: listStories[i]._id,
            content: listStories[i].content,
          };
        })
        .sort(PunctuationService.compareBaseSimilarityRate)
        .slice(0, 5);
      // console.log(storySimilarity);
      const storedSentences = (
        await sentences
          .find({
            bookNId: -2,
            unitNId: -2,
          })
          .toArray()
      ).map((el) => el._id);
      console.log(storedSentences);

      const rawDocs: any[] = [];
      storySimilarity.forEach((el) => {
        if (!storedSentences.includes(el._id)) {
          choices.push(el._id);
          rawDocs.push({
            isConversation: false,
            _id: el._id,
            bookNId: -2,
            unitNId: -2,
            position: 0,
            baseId: el._id,
            content: el.content,
            tempTranslates: [],
            wordBaseIndex: -1,
            translate: '',
            audio: '',
            contentSplit: [],
            translateSplit: [],
            translates: [],
            replaceWords: [],
            lowerBound: 0,
            upperBound: 0,
          });
        }
      });
      if (rawDocs.length > 0) {
        sentences.insertMany(rawDocs, (err, res) => {
          if (err) {
            console.log(err.message);
            throw err;
          }
        });
      }
    }
  }

  public similaritySentences(listSentences: Sentence[]) {
    const content = this.focusSentence.content.trim();
    let choices: Array<string> = [];
    const matchedPunctuations: Sentence[] = [];
    const matchedPunctuationContents: string[] = [];
    for (const sentence of listSentences) {
      const formattedSentenceContent = sentence.content.trim();
      if (
        sentence._id != this.focusSentence._id &&
        formattedSentenceContent != content &&
        Math.abs(formattedSentenceContent.length - content.length) <= 2
      ) {
        if (this.containPunctuations(formattedSentenceContent)) {
          matchedPunctuations.push(sentence);
          matchedPunctuationContents.push(formattedSentenceContent);
        }
      }
    }
    if (matchedPunctuations.length > 0) {
      choices = this.findBestMatchSentences(
        content,
        matchedPunctuationContents,
        matchedPunctuations,
      );
    }
    return choices;
  }

  public async similarityStories(sentences: Collection<Sentence>) {
    const content = this.focusSentence.content.trim();
    const listContents: Array<string> = [];
    const listStories: Array<SimpleStory> = [];

    for (const story of stories) {
      if (story?.content) {
        const trimmedContent = story.content.trim();
        if (
          trimmedContent !== content &&
          Math.abs(trimmedContent.length - content.length) <= 2
        ) {
          if (this.containPunctuations(trimmedContent)) {
            listContents.push(trimmedContent);
            listStories.push(story);
          }
        }
      }
    }
    if (listStories.length > 0) {
      return await this.findBestMatchStories(
        content,
        listContents,
        listStories,
        sentences,
      );
    }
    return [];
  }
}
