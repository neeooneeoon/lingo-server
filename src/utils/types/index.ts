export class SuccessResponse {
    code: number = 1;
    message?: string;
    data: any
};

export class ErrorResponse {
    code: number = 2;
    message?: string;
}