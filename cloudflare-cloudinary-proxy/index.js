// Based on https://developers.cloudflare.com/workers/tutorials/configure-your-cdn

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event))
})

const CLOUD_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

async function serveAsset(event) {
  console.log('Serving asset')
  const url = new URL(event.request.url)
  if (url.pathname.includes('.well-known')) {
    return await fetch(event.request)
  }
  const cache = caches.default
  let response = await cache.match(event.request)
  if (!response) {
    const cloudinaryURL = `${CLOUD_URL}${url.pathname}`;
    console.log('Going to cloudinary url ' + cloudinaryURL)
    response = await fetch(cloudinaryURL)
    // Cache for however long, here is 4 hours.
    const headers = { "cache-control": "public, max-age=14400" }
    response = new Response(response.body, { ...response, headers })
    await cache.put(event.request, response.clone())
    console.log(`Cached requrst for ` + url.pathname)
  } else {
    console.log('Serving from cache')
  }
  return response
}

async function handleRequest(event) {
  console.log('Requesting the image')
  if (event.request.method === "GET") {
    let response = await serveAsset(event)
    if (response.status > 399) {
      response = new Response(response.statusText, { status: response.status })
    }
    return response
  } else {
    return new Response("Method not allowed", { status: 405 })
  }
}
