import Request from './base-request'

const DEFAULT_HOST = 'accounts.spotify.com',
  DEFAULT_PORT = 443,
  DEFAULT_SCHEME = 'https'

const builder = function() {
  return Request.builder()
    .withHost(DEFAULT_HOST)
    .withPort(DEFAULT_PORT)
    .withScheme(DEFAULT_SCHEME)
}

const api = { builder }

export default api
