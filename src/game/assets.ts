// Decode sprites before play so the first frame cannot contain invisible ships.
export async function preloadImages(sources: readonly string[]) {
  await Promise.all(sources.map(async source => {
    const image = new Image()
    image.src = source
    await image.decode()
  }))
}
