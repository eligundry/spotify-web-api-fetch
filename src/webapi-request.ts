import Request from './base-request'

const DEFAULT_HOST = 'api.spotify.com',
  DEFAULT_PORT = 443,
  DEFAULT_SCHEME = 'https'

const builder = function (accessToken: string) {
  return Request.builder()
    .withHost(DEFAULT_HOST)
    .withPort(DEFAULT_PORT)
    .withScheme(DEFAULT_SCHEME)
    .withAuth(accessToken)
}

const api = { builder }

export default api
