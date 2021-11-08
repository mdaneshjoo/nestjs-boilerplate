export class UnauthorizedDto {
  /**
   * Status code in body
   * @example 'Unauthorized'
   */
  errorCode: string;

  /**
   * Error message
   * @example 'Unauthorized'
   */
  errorMessage: string;
}
