import { useDeferredValue, useEffect, useState } from 'react'

type Icon = {
  name: string
  slug: string
  author: string
  path: string
}

const assetRoot = `${import.meta.env.BASE_URL}game-icons/`

function App() {
  const [icons, setIcons] = useState<Icon[]>([])
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.toLowerCase().trim())

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${assetRoot}manifest.json`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ icons: Icon[] }>)
      .then((manifest) => setIcons(manifest.icons))

    return () => controller.abort()
  }, [])

  const results = icons.filter((icon) =>
    `${icon.name} ${icon.author}`.toLowerCase().includes(deferredQuery),
  )

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-6xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Game icons</h1>
        <input
          className="mb-8 w-full border border-neutral-600 bg-transparent p-3 text-inherit"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search icons"
          aria-label="Search icons"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9">
          {results.map((icon) => (
            <figure
              className="m-0 min-w-0"
              key={`${icon.author}/${icon.slug}`}
              title={`${icon.name} by ${icon.author}`}
            >
              <img
                className="block aspect-square w-full"
                src={`${assetRoot}${icon.path.split('/').map(encodeURIComponent).join('/')}`}
                alt={icon.name}
                loading="lazy"
              />
              <figcaption className="mt-2 truncate text-xs capitalize">{icon.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
