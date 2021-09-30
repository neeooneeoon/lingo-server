export class GroupStories {
  bookId: string;
  unitId: string;
  stories: Array<{
    _id: number;
    name: string;
    audio: string;
  }>;
}
