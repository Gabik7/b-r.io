export function GET() {
  return new Response('This portfolio does not publish an RSS feed.', {
    status: 410,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
