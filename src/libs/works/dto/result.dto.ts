export class Result {
    _id: string;
    answer: string | boolean | { first: string, second: string }[] | string[];
    status: boolean;
}