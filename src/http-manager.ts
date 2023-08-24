import {
  TimeoutError,
  WebapiError,
  WebapiRegularError,
  WebapiAuthenticationError,
  WebapiPlayerError,
} from './response-error'
import Request from './base-request'

export type HttpManagerSuccess<Body = any> = {
  body: Body
  headers: Headers
  statusCode: number
}
export type HttpManagerCallback<Body = any> = (
  error: Error | null,
  success: HttpManagerSuccess<Body> | null,
) => void

export default class HttpManager {
  static get(request: Request, callback: HttpManagerCallback) {
    return HttpManager.makeRequest('GET', request, callback)
  }

  static post(request: Request, callback: HttpManagerCallback) {
    return HttpManager.makeRequest('POST', request, callback)
  }

  static del(request: Request, callback: HttpManagerCallback) {
    return HttpManager.makeRequest('DELETE', request, callback)
  }

  static put(request: Request, callback: HttpManagerCallback) {
    return HttpManager.makeRequest('PUT', request, callback)
  }

  private static async makeRequest(
    method: string,
    request: Request,
    callback: HttpManagerCallback,
  ) {
    const headers = request.getHeaders()
    let serializationMethod = JSON.stringify

    if (headers.get('Content-Type') === 'application/x-www-form-urlencoded') {
      serializationMethod = (d) => new URLSearchParams(d).toString()
    }

    const controller = new AbortController()
    let timeoutId

    if (request.getTimeout()) {
      timeoutId = setTimeout(() => {
        controller.abort()
      }, request.getTimeout())
    }

    let body = request.getBodyParameters()

    if (body && typeof body !== 'string') {
      body = serializationMethod(body)
    }

    fetch(request.getURL(), {
      method,
      headers,
      body,
      signal: controller.signal,
    })
      .then(async (resp) => {
        clearTimeout(timeoutId)

        if (!resp.ok) {
          return callback(await this.toError(resp), null)
        }

        return callback(null, {
          body: await resp.json().catch(() => null),
          headers: resp.headers,
          statusCode: resp.status,
        })
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          return callback(
            new TimeoutError(
              `request took longer than ${request.getTimeout()}ms`,
            ),
            null,
          )
        }

        return callback(err, null)
      })
  }

  private static async toError(response: Response) {
    const body = await response.json()

    if (
      typeof body === 'object' &&
      typeof body.error === 'object' &&
      typeof body.error.reason === 'string'
    ) {
      return new WebapiPlayerError(body, response.headers, response.status)
    }

    if (typeof body === 'object' && typeof body.error === 'object') {
      return new WebapiRegularError(body, response.headers, response.status)
    }

    if (typeof body === 'object' && typeof body.error === 'string') {
      return new WebapiAuthenticationError(
        body,
        response.headers,
        response.status,
      )
    }

    /* Other type of error, or unhandled Web API error format */
    return new WebapiError(body, response.headers, response.status, body)
  }
}
