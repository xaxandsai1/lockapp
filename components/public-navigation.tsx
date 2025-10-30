"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function PublicNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // zamknij menu mobilne przy zmianie routa / ESC
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const links = [
    { href: "/", label: "Strona główna" },
    { href: "/apka", label: "Apka" },
    { href: "/auth/logowanie", label: "Logowanie" },
    { href: "/auth/rejestracja", label: "Rejestracja", cta: true },
  ]

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Umbrella — strona główna"
          className="flex items-center gap-2 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="250" height="42" viewBox="0 0 1038 219" fill="none" className="h-10 w-auto">
            <path d="M244.108 80.127H262.02V113.866C262.02 121.291 264.683 124.197 272.024 124.197H289.775C297.116 124.197 299.778 121.291 299.778 113.866V80.127H317.69V117.739C317.69 132.268 310.186 139.209 293.728 139.209H268.071C251.612 139.209 244.108 132.268 244.108 117.739" fill="white"/>
            <path d="M329.796 80.127H357.308L377.559 117.739L397.81 80.127H425.322V138.564H407.895V96.5928H407.733L384.255 138.564H370.862L347.384 96.5928H347.223V138.564H329.796" fill="white"/>
            <path d="M455.34 124.52H487.451C491.324 124.52 493.906 123.631 493.906 120.242C493.906 116.287 491.324 115.399 487.451 115.399H455.34V124.52ZM455.34 103.292H487.047C490.356 103.292 492.292 102.081 492.292 98.7718C492.292 95.3826 490.356 94.1712 487.047 94.1712H455.34V103.292ZM437.429 80.127H488.984C503.265 80.127 510.203 84.0014 510.203 95.4632C510.203 105.472 506.572 107.408 501.57 108.861V109.103C509.397 110.072 512.301 114.269 512.301 123.067C512.301 135.9 504.717 138.564 494.471 138.564H437.429" fill="white"/>
            <path d="M541.027 108.861H570.638C575.477 108.861 577.253 106.925 577.253 102.727V100.79C577.253 95.6241 574.671 94.6559 569.025 94.6559H541.027V108.861ZM523.115 80.127H577.174C590.969 80.127 594.682 86.9877 594.682 97.4809V101.193C594.682 109.022 592.906 113.623 584.674 115.56V115.722C590 116.691 594.436 119.031 594.436 128.635V138.564H576.525V131.542C576.525 125.408 574.749 123.389 569.182 123.389H541.027V138.564H523.115" fill="white"/>
            <path d="M606.785 80.127H670.683V93.6871H624.696V103.05H668.264V115.156H624.696V124.52H671.736V138.564H606.785" fill="white"/>
            <path d="M682.545 80.127H700.461V123.551H740.719V138.564H682.545" fill="white"/>
            <path d="M748.303 80.127H766.219V123.551H806.477V138.564H748.303" fill="white"/>
            <path d="M841.895 115.64H864.813L853.192 93.6866L841.895 115.64ZM841.57 80.127H864.891L897 138.563H877.073L871.506 128.232H835.197L829.96 138.563H809.943" fill="white"/>
            <path d="M109.318 5.8347C91.344 5.8347 68.2755 0.0525501 68.2755 0.0525501C67.3862 -0.171334 66.9442 0.341245 67.2977 1.18907L108.683 101.144C109.036 101.992 109.607 101.992 109.96 101.144L151.345 1.18907C151.699 0.341836 151.257 -0.170175 150.362 0.0531254C150.362 0.0531254 127.299 5.8347 109.318 5.8347Z" fill="#155DFC"/>
            <path d="M109.318 212.9C91.344 212.9 68.2755 218.682 68.2755 218.682C67.3862 218.905 66.9442 218.393 67.2977 217.545L108.683 117.591C109.036 116.742 109.607 116.742 109.96 117.591L151.345 217.544C151.699 218.392 151.257 218.904 150.362 218.681C150.362 218.681 127.299 212.9 109.318 212.9Z" fill="#155DFC"/>
            <path d="M5.83008 109.366C5.83008 127.351 0.052528 150.427 0.052528 150.427C-0.171269 151.317 0.341097 151.758 1.18917 151.407L101.103 110.005C101.951 109.653 101.951 109.078 101.103 108.727L1.18917 67.3251C0.341097 66.9735 -0.171269 67.4147 0.052528 68.3058C0.052528 68.3058 5.83008 91.381 5.83008 109.366Z" fill="#155DFC"/>
            <path d="M212.813 109.366C212.813 127.351 218.591 150.427 218.591 150.427C218.815 151.317 218.302 151.758 217.454 151.407L117.541 110.005C116.692 109.653 116.692 109.078 117.541 108.727L217.454 67.3251C218.302 66.9735 218.815 67.4147 218.591 68.3058C218.591 68.3058 212.813 91.381 212.813 109.366Z" fill="#155DFC"/>
            <path d="M182.5 36.1586C169.784 23.4413 157.564 3.03574 157.564 3.03574C157.093 2.24742 156.415 2.29751 156.068 3.14593L114.683 103.1C114.33 103.949 114.736 104.356 115.584 104.004L215.498 62.6023C216.346 62.2502 216.393 61.5769 215.61 61.1044C215.61 61.1044 195.209 48.876 182.5 36.1586Z" fill="white"/>
            <path d="M36.1424 182.576C23.4272 169.858 3.03225 157.63 3.03225 157.63C2.24307 157.157 2.29604 156.484 3.14411 156.132L103.057 114.73C103.906 114.378 104.312 114.785 103.959 115.634L62.5739 215.587C62.2209 216.436 61.5495 216.486 61.0782 215.698C61.0782 215.698 48.8517 195.293 36.1424 182.576Z" fill="white"/>
            <path d="M36.1424 36.1578C23.4272 48.8752 3.03225 61.1036 3.03225 61.1036C2.24307 61.5762 2.29604 62.2494 3.14411 62.601L103.057 104.003C103.906 104.355 104.312 103.948 103.959 103.099L62.5739 3.14621C62.2209 2.29721 61.5495 2.24772 61.0782 3.03546C61.0782 3.03546 48.8517 23.4404 36.1424 36.1578Z" fill="white"/>
            <path d="M182.5 182.576C169.784 195.293 157.564 215.699 157.564 215.699C157.093 216.487 156.415 216.437 156.068 215.587L114.683 115.633C114.33 114.785 114.736 114.379 115.584 114.73L215.498 156.132C216.346 156.484 216.399 157.157 215.61 157.629C215.61 157.629 195.209 169.858 182.5 182.576Z" fill="white"/>
          </svg>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const isActive = pathname === link.href
            const classBase =
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            if (link.cta) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ml-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {link.label}
                </Link>
              )
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  classBase,
                  isActive
                    ? "bg-blue-400/10 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-slate-800 sm:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Otwórz menu</span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "sm:hidden transition-[max-height,opacity] duration-200 ease-out overflow-hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-3">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-base",
                  link.cta
                    ? "bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    : isActive
                      ? "bg-blue-400/10 text-blue-400"
                      : "text-slate-200 hover:bg-slate-800/60"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
