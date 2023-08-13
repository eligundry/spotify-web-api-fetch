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
    ...args: (
      | string[][]
      | Record<string, string | number | boolean | undefined | null>
      | string
      | URLSearchParams
    )[]
  ) {
    this.queryParameters = args.reduce((acc: URLSearchParams, params) => {
      if (typeof params === 'string') {
        const strParams = new URLSearchParams(params)
        for (const [key, value] of strParams.entries()) {
          if (value) {
            acc.append(key, value)
          }
        }
      } else if (Array.isArray(params)) {
        params.forEach(([key, value]) => {
          if (value) {
            acc.append(key, value)
          }
        })
      } else if (params instanceof URLSearchParams) {
        for (const [key, value] of params.entries()) {
          if (value) {
            acc.append(key, value)
          }
        }
      } else if (typeof params === 'object') {
        for (const key in params) {
          const value = params[key]

          if (value) {
            acc.append(key, value.toString())
          }
        }
      }

      return acc
    }, this.queryParameters)

    return this
  }

  withBodyParameters(bodyParameters: any) {
    this.bodyParameters = bodyParameters
    return this
  }

  withHeaders(headers: HeadersInit) {
    this.headers = new Headers(headers)
    return this
  }

  withTimeout(timeout: number) {
    this.timeout = timeout
    return this
  }

  withAuth(accessToken: string) {
    this.headers.set('Authorization', `Bearer ${accessToken}`)
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
//
// var Request = function(builder) {
//   if (!builder) {
//     throw new Error('No builder supplied to constructor')
//   }
//
//   this.host = builder.host
//   this.port = builder.port
//   this.scheme = builder.scheme
//   this.queryParameters = builder.queryParameters
//   this.bodyParameters = builder.bodyParameters
//   this.headers = builder.headers
//   this.path = builder.path
//   this.timeout = builder.timeout
// }
//
// Request.prototype._getter = function(key) {
//   return function() {
//     return this[key]
//   }
// }
//
// Request.prototype.getHost = Request.prototype._getter('host')
//
// Request.prototype.getPort = Request.prototype._getter('port')
//
// Request.prototype.getScheme = Request.prototype._getter('scheme')
//
// Request.prototype.getPath = Request.prototype._getter('path')
//
// Request.prototype.getQueryParameters = Request.prototype._getter(
//   'queryParameters',
// )
//
// Request.prototype.getBodyParameters = Request.prototype._getter(
//   'bodyParameters',
// )
//
// Request.prototype.getHeaders = Request.prototype._getter('headers')
//
// Request.prototype.getTimeout = Request.prototype._getter('timeout')
//
// Request.prototype.getURI = function() {
//   if (!this.scheme || !this.host || !this.port) {
//     throw new Error('Missing components necessary to construct URI')
//   }
//   var uri = this.scheme + '://' + this.host
//   if (
//     (this.scheme === 'http' && this.port !== 80) ||
//     (this.scheme === 'https' && this.port !== 443)
//   ) {
//     uri += ':' + this.port
//   }
//   if (this.path) {
//     uri += this.path
//   }
//   return uri
// }
//
// Request.prototype.getURL = function() {
//   var uri = this.getURI()
//   if (this.getQueryParameters()) {
//     return uri + this.getQueryParameterString(this.getQueryParameters())
//   } else {
//     return uri
//   }
// }
//
// Request.prototype.getQueryParameterString = function() {
//   var queryParameters = this.getQueryParameters()
//   if (queryParameters) {
//     return (
//       '?' +
//       Object.keys(queryParameters)
//         .filter(function(key) {
//           return queryParameters[key] !== undefined
//         })
//         .map(function(key) {
//           return key + '=' + queryParameters[key]
//         })
//         .join('&')
//     )
//   }
// }
//
// Request.prototype.execute = function(method, callback) {
//   if (callback) {
//     method(this, callback)
//     return
//   }
//   var _self = this
//
//   return new Promise(function(resolve, reject) {
//     method(_self, function(error, result) {
//       if (error) {
//         reject(error)
//       } else {
//         resolve(result)
//       }
//     })
//   })
// }
//
// var Builder = function() { }
//
// Builder.prototype._setter = function(key) {
//   return function(value) {
//     this[key] = value
//     return this
//   }
// }
//
// Builder.prototype.withHost = Builder.prototype._setter('host')
//
// Builder.prototype.withPort = Builder.prototype._setter('port')
//
// Builder.prototype.withScheme = Builder.prototype._setter('scheme')
//
// Builder.prototype.withPath = Builder.prototype._setter('path')
//
// Builder.prototype._assigner = function(key) {
//   return function() {
//     for (var i = 0; i < arguments.length; i++) {
//       this[key] = this._assign(this[key], arguments[i])
//     }
//
//     return this
//   }
// }
//
// Builder.prototype.withQueryParameters = Builder.prototype._assigner(
//   'queryParameters',
// )
//
// Builder.prototype.withBodyParameters = Builder.prototype._assigner(
//   'bodyParameters',
// )
//
// Builder.prototype.withHeaders = Builder.prototype._assigner('headers')
//
// Builder.prototype.withTimeout = Builder.prototype._setter('timeout')
//
// Builder.prototype.withAuth = function(accessToken) {
//   if (accessToken) {
//     this.withHeaders({ Authorization: 'Bearer ' + accessToken })
//   }
//   return this
// }
//
// Builder.prototype._assign = function(src, obj) {
//   if (obj && Array.isArray(obj)) {
//     return obj
//   }
//   if (obj && typeof obj === 'string') {
//     return obj
//   }
//   if (obj && Object.keys(obj).length > 0) {
//     return Object.assign(src || {}, obj)
//   }
//   return src
// }
//
// Builder.prototype.build = function() {
//   return new Request(this)
// }
//
// module.exports.builder = function() {
//   return new Builder()
// }
