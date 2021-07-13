export class AnswerResult {
  _id: string;
  answer:
    | string
    | boolean
    | { first: string; second: string }[]
    | string[]
    | number;
  status: boolean;
}
