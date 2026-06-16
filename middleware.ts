export const config = {
  matcher: ['/((?!assets/|favicon.ico|robots.txt).*)'],
}

export default function middleware(request: Request) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS

  if (!user || !pass) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } })
  }

  const expected = 'Basic ' + btoa(`${user}:${pass}`)
  const provided = request.headers.get('authorization')

  if (provided === expected) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } })
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Locker Portal"' },
  })
}
