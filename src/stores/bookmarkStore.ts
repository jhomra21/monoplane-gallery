import { Store } from '@tanstack/store'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface BookmarkedPlane {
  id: number
  name: string
  manufacturer: string
  firstFlight: string
  imageUrl: string
}

interface BookmarkState {
  bookmarkedPlanes: Map<number, BookmarkedPlane>
  version: number
}

// Load initial state from localStorage
const loadInitialState = (): BookmarkState => {
  try {
    const savedBookmarks = localStorage.getItem('bookmarkedPlanes')
    if (savedBookmarks) {
      const parsed = JSON.parse(savedBookmarks)
      return {
        bookmarkedPlanes: new Map(Object.entries(parsed).map(([key, value]) => [Number(key), value as BookmarkedPlane])),
        version: 0
      }
    }
  } catch (error) {
    console.error('Error loading bookmarks:', error)
  }
  return { 
    bookmarkedPlanes: new Map(),
    version: 0
  }
}

export const bookmarkStore = new Store<BookmarkState>(loadInitialState())

// Save to localStorage whenever state changes
bookmarkStore.subscribe((state) => {
  try {
    const currentState = state as unknown as BookmarkState;
    if (!currentState.bookmarkedPlanes) return;
    
    const entries = Array.from(currentState.bookmarkedPlanes.entries());
    const bookmarks = Object.fromEntries(
      entries.map(([key, value]) => [key.toString(), value])
    );
    localStorage.setItem('bookmarkedPlanes', JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
});

const toastStyles = {
  className: 'font-mono border border-cyan-500/20 bg-[#0a0a0a]/95 backdrop-blur-sm',
  style: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
  },
  position: 'bottom-right' as const,
  duration: 3000,
  unstyled: true,
  dismissible: true,
  classNames: {
    title: 'text-[#00ff00] text-sm leading-none inline-block',
    description: 'text-cyan-400 text-xs leading-none inline-block ml-2',
    toast: 'font-mono border border-cyan-500/20 bg-[#0a0a0a]/95 backdrop-blur-sm py-2 px-3 flex items-center gap-2 min-h-0',
    toastGroup: 'mr-0',
    closeButton: 'text-cyan-400 hover:text-cyan-300 transition-colors ml-2 opacity-50 hover:opacity-100'
  }
}

export const toggleBookmark = (plane: BookmarkedPlane) => {
  bookmarkStore.setState((state) => {
    const newBookmarks = new Map(state.bookmarkedPlanes)
    const isCurrentlyBookmarked = newBookmarks.has(plane.id)
    
    if (isCurrentlyBookmarked) {
      newBookmarks.delete(plane.id)
      toast(plane.name, {
        ...toastStyles,
        description: 'removed from bookmarks'
      })
    } else {
      newBookmarks.set(plane.id, plane)
      toast(plane.name, {
        ...toastStyles,
        description: 'added to bookmarks'
      })
    }

    return {
      bookmarkedPlanes: newBookmarks,
      version: state.version + 1
    }
  })
}

export const isBookmarked = (planeId: number): boolean => {
  return bookmarkStore.state.bookmarkedPlanes.has(planeId)
}

export const getBookmarkedPlanes = (): BookmarkedPlane[] => {
  return Array.from(bookmarkStore.state.bookmarkedPlanes.values())
}

export const clearAllBookmarks = () => {
  bookmarkStore.setState((state) => ({
    bookmarkedPlanes: new Map(),
    version: state.version + 1
  }))
  toast.success('SYS.CLEAR', {
    ...toastStyles,
    description: 'all bookmarks cleared'
  })
} 