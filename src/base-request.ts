export class Builder {
  public host: string = 'api.spotify.com'
  public port: string | number = 443
  public scheme: string = 'https'
  public path: string = ''
  public queryParameters: URLSearchParams = new URLSearchParams()
  public bodyParameters: any = undefined
  public headers: Headers = new Headers()
  public timeout: number = 0

  withHost(host: string) {
    this.host = host
    return this
  }

  withPort(port: string | number) {
    this.port = port
    return this
  }

  withScheme(scheme: string) {
    this.scheme = scheme
    return this
  }

  withPath(path: string) {
    this.path = path
    return this
  }

  withQueryParameters(
    params:
      | string[][]
      | Record<string, string | number | boolean | undefined | null>
      | string
      | URLSearchParams
      | undefined
      | any,
  ) {
    if (typeof params === 'string') {
      const strParams = new URLSearchParams(params)
      for (const [key, value] of strParams.entries()) {
        if (typeof value !== 'undefined' && value !== null) {
          this.queryParameters.append(key, value)
        }
      }
    } else if (Array.isArray(params)) {
      params.forEach(([key, value]) => {
        if (typeof value !== 'undefined' && value !== null) {
          this.queryParameters.append(key, value)
        }
      })
    } else if (params instanceof URLSearchParams) {
      for (const [key, value] of params.entries()) {
        if (typeof value !== 'undefined' && value !== null) {
          this.queryParameters.append(key, value)
        }
      }
    } else if (typeof params === 'object') {
      for (const key in params) {
        const value = params[key]

        if (typeof value !== 'undefined' && value !== null) {
          this.queryParameters.append(key, value.toString())
        }
      }
    }

    return this
  }

  withBodyParameters(
    params: any[] | Record<string, any> | string | null | undefined,
  ) {
    if (!params) {
      this.bodyParameters = undefined
    } else if (!this.bodyParameters) {
      this.bodyParameters = params
    } else if (Array.isArray(this.bodyParameters)) {
      const values = Array.isArray(params) ? params : [params]
      this.bodyParameters = [...this.bodyParameters, ...values]
    } else if (typeof this.bodyParameters === 'object') {
      // @ts-ignore
      this.bodyParameters = { ...this.bodyParameters, ...params }
    }

    return this
  }

  asJSON() {
    this.headers.set('Content-Type', 'application/json')
    return this
  }

  withHeaders(headers: HeadersInit) {
    const newHeaders = new Headers(headers)
    newHeaders.forEach((value, key) => {
      this.headers.append(key, value)
    })
    return this
  }

  withTimeout(timeout: number) {
    this.timeout = timeout
    return this
  }

  withAuth(accessToken: string | null | undefined) {
    if (accessToken) {
      this.withHeaders({ Authorization: `Bearer ${accessToken}` })
    } else {
      this.headers.delete('Authorization')
    }

    return this
  }

  build() {
    return new Request(this)
  }
}

export default class Request {
  public host: string
  public port: string | number
  public scheme: string
  public path: string
  public queryParameters: URLSearchParams
  public bodyParameters: any
  public headers: Headers
  public timeout: number

  constructor(builder: Builder) {
    this.host = builder.host
    this.port = builder.port
    this.scheme = builder.scheme
    this.queryParameters = builder.queryParameters
    this.bodyParameters = builder.bodyParameters
    this.headers = builder.headers
    this.path = builder.path
    this.timeout = builder.timeout
  }

  getHost() {
    return this.host
  }

  getPort() {
    return this.port
  }

  getScheme() {
    return this.scheme
  }

  getPath() {
    return this.path
  }

  getQueryParameters() {
    return this.queryParameters
  }

  getBodyParameters() {
    return this.bodyParameters
  }

  getHeaders() {
    return this.headers
  }

  getTimeout() {
    return this.timeout
  }

  getURI() {
    if (!this.scheme || !this.host || !this.port) {
      throw new Error('Missing components necessary to construct URI')
    }

    const uri = new URL('https://example.com')
    uri.protocol = this.scheme + ':'
    uri.hostname = this.host

    if (
      (this.scheme === 'http' && this.port != 80) ||
      (this.scheme === 'https' && this.port != 443)
    ) {
      uri.port = this.port.toString()
    }

    if (this.path) {
      uri.pathname = this.path
    }

    return uri.toString()
  }

  getURL() {
    const url = new URL(this.getURI())
    url.search = this.getQueryParameters().toString()
    return url.toString()
  }

  getQueryParameterString() {
    if (this.getQueryParameters().toString() === '') {
      return ''
    }

    return `?${this.getQueryParameters().toString()}`
  }

  execute(method, callback) {
    if (callback) {
      method(this, callback)
      return
    }
    var _self = this

    return new Promise(function(resolve, reject) {
      method(_self, function(error, result) {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  static builder() {
    return new Builder()
  }
}
