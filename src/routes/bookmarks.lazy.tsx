import { createLazyFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { bookmarkStore } from '@/stores/bookmarkStore'
import { useCallback, useState } from 'react'
import { BookmarkPlaneDialog } from '@/components/BookmarkPlaneDialog'
export const Route = createLazyFileRoute('/bookmarks')({
  component: BookmarksPage,
})

function BookmarksPage() {
  const [selectedPlane, setSelectedPlane] = useState<{
    id: number
    name: string
    manufacturer: string
    firstFlight: string
    imageUrl: string
  } | null>(null)

  const bookmarkedPlanes = useStore(
    bookmarkStore,
    useCallback((state) => Array.from(state.bookmarkedPlanes.values()), []),
  )

  const handlePlaneClick = useCallback((plane: typeof selectedPlane) => {
    setSelectedPlane(plane)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="container mx-auto px-4 pt-24">
        {bookmarkedPlanes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyan-400 font-mono">
              No bookmarked planes found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedPlanes.map((plane) => (
              <div
                key={(plane as any).id}
                className="relative aspect-[4/3] cursor-pointer group"
                onClick={() => handlePlaneClick(plane as any)}
              >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500/40 z-10" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500/40 z-10" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500/40 z-10" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500/40 z-10" />

                <img
                  src={(plane as any).imageUrl}
                  alt={(plane as any).name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                />

                {/* Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-cyan-500/20 p-4">
                  <h2 className="font-mono text-xl font-bold text-[#00ff00] mb-1">
                    {(plane as any).name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-cyan-400">
                      SYS.ID: {(plane as any).id.toString().padStart(4, '0')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <BookmarkPlaneDialog
          plane={selectedPlane!}
          open={!!selectedPlane}
          onOpenChange={(open) => !open && setSelectedPlane(null)}
        />
      </main>
    </div>
  )
}
