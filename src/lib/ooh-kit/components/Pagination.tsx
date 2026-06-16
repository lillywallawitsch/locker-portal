import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const [showDropdown, setShowDropdown] = useState(false)
  const [pageInput, setPageInput] = useState(String(currentPage))
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handlePageInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput, 10)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page)
      } else {
        setPageInput(String(currentPage))
      }
      ;(e.target as HTMLInputElement).blur()
    }
  }

  function handlePageInputBlur() {
    const page = parseInt(pageInput, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
    } else {
      setPageInput(String(currentPage))
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 bg-surface-default">
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        <span className="text-sm text-text-light font-medium tracking-[-0.14px] leading-[22px] hidden sm:inline">
          Showing {startItem} to {endItem} of {totalItems} Items
        </span>
        <span className="text-sm text-text-light font-medium tracking-[-0.14px] leading-[22px] sm:hidden">
          {startItem}–{endItem} of {totalItems}
        </span>
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Items per page"
            aria-haspopup="true"
            aria-expanded={showDropdown}
            className="flex items-center gap-2 h-[38px] px-3 border border-border-light rounded-lg bg-transparent cursor-pointer"
          >
            <span className="text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[18px]">
              {itemsPerPage}
            </span>
            <ChevronDown size={16} aria-hidden="true" className="text-text-foreground" />
          </button>
          {showDropdown && (
            <div className="absolute bottom-full mb-1 left-0 bg-surface-default border border-border-default rounded-lg shadow-lg z-10 overflow-hidden">
              {PAGE_SIZE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onItemsPerPageChange?.(option)
                    setShowDropdown(false)
                  }}
                  className={`block w-full px-4 py-2 text-sm text-left cursor-pointer border-0 ${
                    option === itemsPerPage
                      ? 'bg-surface-primary/10 text-text-primary font-medium'
                      : 'bg-transparent text-text-foreground hover:bg-surface-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <span className="text-sm text-text-light font-medium tracking-[-0.14px] leading-[22px] hidden sm:inline">
            Items per Page
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <span className="text-sm text-text-light font-medium tracking-[-0.14px] leading-[18px]">
            Page
          </span>
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={handlePageInputKeyDown}
            onBlur={handlePageInputBlur}
            aria-label="Page number"
            className="w-[46px] h-[38px] border border-border-light rounded-lg text-sm text-text-foreground font-medium tracking-[-0.14px] leading-[18px] text-center bg-transparent outline-none focus:border-border-primary"
          />
          <span className="text-sm text-text-light font-medium tracking-[-0.14px] leading-[18px]">
            of {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="flex items-center justify-center w-[38px] h-[38px] rounded-lg bg-button-secondary border-0 cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft size={20} className="text-text-foreground" />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border border-border-light bg-transparent cursor-pointer disabled:opacity-50"
          >
            <ChevronRight size={20} className="text-text-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
