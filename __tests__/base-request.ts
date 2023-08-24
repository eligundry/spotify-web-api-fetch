import Request from '../src/base-request'

describe('Create Requests', () => {
  test('Should create host, port, and scheme', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withScheme('http')
      .build()

    expect(request.getHost()).toBe('such.api.wow')
    expect(request.getPort()).toBe(1337)
    expect(request.getScheme()).toBe('http')
  })

  test('Should add query parameters', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withScheme('http')
      .withQueryParameters({
        oneParameter: 1,
        anotherParameter: true,
        thirdParameter: 'hello',
      })
      .build()

    expect(request.getQueryParameters().get('oneParameter')).toBe('1')
    expect(request.getQueryParameters().get('anotherParameter')).toBe('true')
    expect(request.getQueryParameters().get('thirdParameter')).toBe('hello')
  })

  test('Should add query parameters (multiple calls)', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withScheme('http')
      .withQueryParameters({
        oneParameter: 1,
        anotherParameter: true,
      })
      .withQueryParameters({
        thirdParameter: 'hello',
      })
      .build()

    expect(request.getQueryParameters().get('oneParameter')).toBe('1')
    expect(request.getQueryParameters().get('anotherParameter')).toBe('true')
    expect(request.getQueryParameters().get('thirdParameter')).toBe('hello')
  })

  test('Should add body parameters', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withScheme('http')
      .withBodyParameters({
        one: 1,
        two: true,
        three: 'world',
      })
      .build()

    expect(request.getBodyParameters().one).toBe(1)
    expect(request.getBodyParameters().two).toBe(true)
    expect(request.getBodyParameters().three).toBe('world')
  })

  test('Should add array to body parameters', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withScheme('http')
      .withBodyParameters(['3VNWq8rTnQG6fM1eldSpZ0'])
      .build()

    expect(request.getBodyParameters()).toEqual(['3VNWq8rTnQG6fM1eldSpZ0'])
  })

  test('Should add header parameters', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withScheme('http')
      .withHeaders({
        Authorization: 'Basic WOOP',
      })
      .asJSON()
      .build()

    expect(request.getHeaders().get('Authorization')).toBe('Basic WOOP')
    expect(request.getHeaders().get('Content-Type')).toBe('application/json')
  })

  test('Should add path', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withPort(1337)
      .withPath('/v1/users/meriosweg')
      .build()

    expect(request.getPath()).toBe('/v1/users/meriosweg')
  })

  test('Should build URI', () => {
    var request = Request.builder()
      .withHost('such.api.wow')
      .withScheme('https')
      .withPort(1337)
      .withPath('/v1/users/meriosweg')
      .build()

    expect(request.getURI()).toBe(
      'https://such.api.wow:1337/v1/users/meriosweg',
    )
  })

  test('Should construct empty query paramaters string', () => {
    var request = Request.builder().withQueryParameters({}).build()

    expect(request.getQueryParameterString()).toBeFalsy()
  })

  test('Should construct query paramaters string for one parameter', () => {
    var request = Request.builder()
      .withQueryParameters({
        one: 1,
      })
      .build()

    expect(request.getQueryParameterString()).toBe('?one=1')
  })

  test('Should construct query paramaters string for multiple parameters', () => {
    var request = Request.builder()
      .withQueryParameters({
        one: 1,
        two: true,
        three: 'world',
      })
      .build()

    expect(request.getQueryParameterString()).toBe(
      '?one=1&two=true&three=world',
    )
  })

  test('Should construct query paramaters string and exclude undefined values', () => {
    var request = Request.builder()
      .withQueryParameters({
        one: 1,
        two: undefined,
        three: 'world',
      })
      .build()

    expect(request.getQueryParameterString()).toBe('?one=1&three=world')
  })
})
