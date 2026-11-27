'use client'

import { useEffect } from 'react'

/**
 * The original policy pages' inline script: highlights the contents entry for the section on
 * screen and scrolls smoothly when one is clicked. Works on the markup rendered next to it.
 */
export function PolicyToc() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.kf-policy .toc-link'))
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.kf-policy .policy-section'))
    let active: string | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) active = entry.target.id
        })
        links.forEach((l) => l.classList.toggle('active', l.dataset.section === active))
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    )
    sections.forEach((s) => observer.observe(s))

    const onClick = (e: Event) => {
      const link = e.currentTarget as HTMLAnchorElement
      const target = document.getElementById(link.dataset.section || '')
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${target.id}`)
    }
    links.forEach((l) => l.addEventListener('click', onClick))

    return () => {
      observer.disconnect()
      links.forEach((l) => l.removeEventListener('click', onClick))
    }
  }, [])
  return null
}
