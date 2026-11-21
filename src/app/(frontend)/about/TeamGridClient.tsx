'use client'

import { useState } from 'react'
import Image from 'next/image'

const TEAM = [
  {
    name: 'Lhenna-Marie Velasco',
    role: 'Founder & CEO',
    subrole: 'Project Manager & Front-End Developer',
    photo: '/assets/img/Lhenna.png',
    bio: 'BSIT student at PUP Sta. Maria with a strong focus on UI/UX design and front-end engineering. Designed Kasafide in Figma and crafted the interactive Sta. Maria barangay map.',
    skills: ['Figma', 'UI/UX', 'React', 'Next.js'],
  },
  {
    name: 'Aljon Lenard Gumafelix',
    role: 'Co-Founder & COO',
    subrole: 'QA Tester & Lead Researcher',
    photo: '/assets/img/Aljon.png',
    bio: 'BSIT student at PUP Sta. Maria aiming to become a SOC Analyst. Gathered community housing needs and translated them into identity verification, location search, and secure payment flows.',
    skills: ['QA', 'Security', 'Research', 'SQL'],
  },
  {
    name: 'Emmanuel John Catiis',
    role: 'Founding Engineer',
    subrole: 'Database Manager',
    photo: '/assets/img/Emman.png',
    bio: 'BSIT student at PUP Sta. Maria focused on structured data management. Oversees accounts, property schemas, verification records, and fast barangay queries.',
    skills: ['Data Modeling', 'SQL', 'AI Tools', 'APIs'],
  },
  {
    name: 'Ma. Melchora Lyndt Dayrit',
    role: 'Founding Engineer',
    subrole: 'Back-End Developer',
    photo: '/assets/img/Ma. Melchora.png',
    bio: 'BSIT student at PUP Sta. Maria specializing in back-end architecture, access control rules, and cloud security toward a SOC Analyst career.',
    skills: ['Back-End', 'Access Control', 'Auth', 'Cloud'],
  },
]

export function TeamGridClient() {
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {TEAM.map((m, i) => {
        const isFlipped = flippedIdx === i
        return (
          <div
            key={m.name}
            tabIndex={0}
            role="button"
            aria-label={`${m.name}, ${m.role}. Tap to flip profile card.`}
            onClick={() => setFlippedIdx(isFlipped ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setFlippedIdx(isFlipped ? null : i)
              }
            }}
            className={`kf-team-card h-[380px] cursor-pointer ${isFlipped ? 'is-flipped' : ''}`}
          >
            <div className="kf-team-flip relative w-full h-full">
              {/* Front */}
              <div className="kf-team-face absolute inset-0 rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex flex-col">
                <div className="relative flex-1 w-full bg-[var(--surface-soft)]">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-4 bg-[var(--surface)]">
                  <div className="font-extrabold text-sm text-[var(--text)]">{m.name}</div>
                  <div className="text-xs font-bold text-[var(--primary)] mt-0.5">{m.role}</div>
                </div>
              </div>

              {/* Back */}
              <div className="kf-team-face kf-team-back absolute inset-0 rounded-3xl border border-[var(--primary)] bg-[var(--surface)] p-5 flex flex-col justify-between">
                <div>
                  <div className="font-extrabold text-base text-[var(--text)]">{m.name}</div>
                  <div className="text-xs font-bold text-[var(--primary)] mb-2">{m.role}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    {m.subrole}
                  </div>
                  <p className="text-xs text-[var(--text-soft)] leading-relaxed">{m.bio}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-[10.5px] font-bold text-[var(--text)]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
