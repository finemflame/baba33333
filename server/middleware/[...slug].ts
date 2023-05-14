export default defineEventHandler(async (event) => {
  const headers = event.req.headers;
  const redirectUrl = "https://markmystories.com" + event.req.url;

  // Check if the redirect response is already cached at the edge
  if (event?.response?.headers?.get('x-vercel-cache') === 'HIT') {
    const cachedResponse = await getCachedResponse(redirectUrl);
    if (cachedResponse) {
      event.send(cachedResponse);
      return;
    }
  }

  // Perform the redirect
  sendRedirect(event, redirectUrl);

  // Cache the redirect response
  await cacheResponse(redirectUrl, event.response);
});

const getCachedResponse = async (url) => {
  const cache = await caches.open('cdn-cache');
  return await cache.match(url);
};

const cacheResponse = async (url, response) => {
  const cache = await caches.open('cdn-cache');
  await cache.put(url, response.clone());
};
