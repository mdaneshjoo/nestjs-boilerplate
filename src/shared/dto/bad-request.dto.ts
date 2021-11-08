export class BadRequestDto {
  /**
   * Status code in body
   * @example Bad Request
   */
  errorCode: string;

  /**
   * List of error messages
   * @example ['property test should not exist']
   */
  errorMessage: Array<string>;
}
