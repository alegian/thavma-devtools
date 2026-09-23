import { useDeferredValue, useEffect, useState } from 'react'
import './App.css'

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
    <main>
      <h1>Game icons</h1>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search icons"
        aria-label="Search icons"
        autoFocus
      />
      <div className="icons">
        {results.map((icon) => (
          <figure key={`${icon.author}/${icon.slug}`} title={`${icon.name} by ${icon.author}`}>
            <img
              src={`${assetRoot}${icon.path.split('/').map(encodeURIComponent).join('/')}`}
              alt={icon.name}
              loading="lazy"
            />
            <figcaption>{icon.name}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  )
}

export default App
