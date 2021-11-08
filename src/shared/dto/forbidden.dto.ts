export class ForbiddenDto {
  /**
   * Status code in body
   * @example Forbidden
   */
  errorCode: string;

  /**
   * the authorized not have permission to access this resource.
   * @example 'Forbidden resource'
   */
  errorMessage: string;
}
