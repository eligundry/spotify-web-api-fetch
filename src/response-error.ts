/* Timeout */
export class NamedError extends Error {
  get name() {
    return this.constructor.name
  }
}

export class TimeoutError extends NamedError {
  constructor(message?: string) {
    super(
      "A timeout occurred while communicating with Spotify's Web API" +
      (message ? `: ${message}` : '.'),
    )
  }
}

/* Web API Parent and fallback error */
export class WebapiError extends NamedError {
  public body: Record<string, any>
  public headers: Headers
  public statusCode: number

  constructor(
    body: Record<string, any>,
    headers: Headers,
    statusCode: number,
    message: string,
  ) {
    super(message)
    this.body = body
    this.headers = headers
    this.statusCode = statusCode
  }
}

/**
 * Regular Error
 * { status : <integer>, message : <string> }
 */
export class WebapiRegularError extends WebapiError {
  constructor(body: Record<string, any>, headers: Headers, statusCode: number) {
    const message =
      "An error occurred while communicating with Spotify's Web API.\n" +
      'Details: ' +
      body.error.message +
      '.'

    super(body, headers, statusCode, message)
  }
}

/**
 * Authentication Error
 * { error : <string>, error_description : <string> }
 */
export class WebapiAuthenticationError extends WebapiError {
  constructor(body: Record<string, any>, headers: Headers, statusCode: number) {
    const message =
      "An authentication error occurred while communicating with Spotify's Web API.\n" +
      'Details: ' +
      body.error +
      (body.error_description ? ' ' + body.error_description + '.' : '.')

    super(body, headers, statusCode, message)
  }
}

/**
 * Player Error
 * { status : <integer>, message : <string>, reason : <string> }
 */
export class WebapiPlayerError extends WebapiError {
  constructor(body: Record<string, any>, headers: Headers, statusCode: number) {
    const message =
      "An error occurred while communicating with Spotify's Web API.\n" +
      'Details: ' +
      body.error.message +
      (body.error.reason ? ' ' + body.error.reason + '.' : '.')

    super(body, headers, statusCode, message)
  }
}
