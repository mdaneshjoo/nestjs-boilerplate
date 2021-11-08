export class InternalServerErrorDto {
  /**
   * Status code in body
   * @example 500
   */
  statusCode: string;

  /**
   * in dev environment it actual error message but in production it will show this message
   * @example 'Something went wrong please try again or report this message to us'
   */
  message: string;
}
