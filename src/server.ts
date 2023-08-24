import WebSpotifyApi, { Callback, Response } from './spotify-web-api'
import AuthenticationRequest from './authentication-request'
import HttpManager from './http-manager'

/**
 * Response returned when using Client Credentials authentication flow
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#example-4
 */
export interface ClientCredentialsGrantResponse {
  access_token: string
  expires_in: number
  token_type: string
}

/**
 * Response returned when requesting for access token
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#2-have-your-application-request-refresh-and-access-tokens-spotify-returns-access-and-refresh-tokens
 */
export interface AuthorizationCodeGrantResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

/**
 * Response returned when requesting new access token (via refresh token)
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#4-requesting-a-refreshed-access-token-spotify-returns-a-new-access-token-to-your-app
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#6-requesting-a-refreshed-access-token
 */
export interface RefreshAccessTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string | undefined
  scope: string
  token_type: string
}

export default class ServerSpotifyWebApi extends WebSpotifyApi {
  /**
   * Retrieve a URL where the user can give the application permissions.
   * @param scopes The scopes corresponding to the permissions the application needs.
   * @param state A parameter that you can use to maintain a value between the request and the callback to redirect_uri.It is useful to prevent CSRF exploits.
   * @param showDialog A parameter that you can use to force the user to approve the app on each login rather than being automatically redirected.
   * @returns The URL where the user can give application permissions.
   */
  createAuthorizeURL(
    scopes: ReadonlyArray<string>,
    state?: string,
    showDialog = false,
    responseType: 'code' | 'token' = 'code',
  ) {
    return AuthenticationRequest.builder()
      .withPath('/authorize')
      .withQueryParameters({
        client_id: this.getClientId(),
        response_type: responseType,
        redirect_uri: this.getRedirectURI(),
        scope: scopes.join(','),
        state: state,
        show_dialog: !!showDialog,
      })
      .build()
      .getURL()
  }

  /**
   * Request an access token using the Client Credentials flow.
   * Requires that client ID and client secret has been set previous to the call.
   * @param options Options.
   * @param callback Optional callback method to be called instead of the promise.
   * @returns A promise that if successful, resolves into an object containing the access token,
   *          token type and time to expiration. If rejected, it contains an error object. Not returned if a callback is given.
   */
  clientCredentialsGrant(
    callback: Callback<ClientCredentialsGrantResponse>,
  ): void
  clientCredentialsGrant(): Promise<Response<ClientCredentialsGrantResponse>>
  clientCredentialsGrant(callback?: Callback<ClientCredentialsGrantResponse>) {
    return AuthenticationRequest.builder()
      .withPath('/api/token')
      .withBodyParameters({
        grant_type: 'client_credentials',
      })
      .withHeaders({
        Authorization:
          'Basic ' +
          new Buffer(
            this.getClientId() + ':' + this.getClientSecret(),
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      .build()
      .execute(HttpManager.post, callback)
  }

  /**
   * Request an access token using the Authorization Code flow.
   * Requires that client ID, client secret, and redirect URI has been set previous to the call.
   * @param code The authorization code returned in the callback in the Authorization Code flow.
   * @param callback Optional callback method to be called instead of the promise.
   * @returns A promise that if successful, resolves into an object containing the access token,
   *          refresh token, token type and time to expiration. If rejected, it contains an error object.
   *          Not returned if a callback is given.
   */
  authorizationCodeGrant(
    code: string,
    callback: Callback<AuthorizationCodeGrantResponse>,
  ): void
  authorizationCodeGrant(
    code: string,
  ): Promise<Response<AuthorizationCodeGrantResponse>>
  authorizationCodeGrant(
    code: string,
    callback?: Callback<AuthorizationCodeGrantResponse>,
  ) {
    return AuthenticationRequest.builder()
      .withPath('/api/token')
      .withBodyParameters({
        grant_type: 'authorization_code',
        redirect_uri: this.getRedirectURI(),
        code: code,
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
      })
      .withHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      .build()
      .execute(HttpManager.post, callback)
  }

  /**
   * Refresh the access token given that it hasn't expired.
   * Requires that client ID, client secret and refresh token has been set previous to the call.
   * @param callback Optional callback method to be called instead of the promise.
   * @returns A promise that if successful, resolves to an object containing the
   *          access token, time to expiration and token type. If rejected, it contains an error object.
   *          Not returned if a callback is given.
   */
  refreshAccessToken(callback: Callback<RefreshAccessTokenResponse>): void
  refreshAccessToken(): Promise<Response<RefreshAccessTokenResponse>>
  refreshAccessToken(callback?: Callback<RefreshAccessTokenResponse>) {
    const basicAuthToken = new Buffer(
      this.getClientId() + ':' + this.getClientSecret(),
    ).toString('base64')

    return AuthenticationRequest.builder()
      .withPath('/api/token')
      .withBodyParameters({
        grant_type: 'refresh_token',
        refresh_token: this.getRefreshToken(),
      })
      .withHeaders({
        Authorization: `Basic ${basicAuthToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      .build()
      .execute(HttpManager.post, callback)
  }
}
