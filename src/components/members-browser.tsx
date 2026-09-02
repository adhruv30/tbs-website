'use client'

import { useId, useRef, useState } from 'react'

import { MemberCard } from '@/components/member-card'
import type { Cohort, Member } from '@/data/members'

type Tab = { id: Cohort; label: string }

export function MembersBrowser({
  tabs,
  groups,
}: {
  tabs: readonly Tab[]
  groups: Record<Cohort, Member[]>
}) {
  const [activeTab, setActiveTab] = useState<Cohort>(tabs[0].id)
  const baseId = useId()
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKeyDown = (event: React.KeyboardEvent) => {
    const offset =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!offset) return
    event.preventDefault()
    const current = tabs.findIndex((tab) => tab.id === activeTab)
    const next = tabs[(current + offset + tabs.length) % tabs.length]
    setActiveTab(next.id)
    tabRefs.current[next.id]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Member groups"
        onKeyDown={onKeyDown}
        className="inline-flex rounded-full border border-sand-dark bg-white p-1"
      >
        {tabs.map((tab) => {
          const selected = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors sm:px-7 ${
                selected
                  ? 'bg-navy-900 text-parchment'
                  : 'text-navy-700/70 hover:text-navy-900'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-60">
                {groups[tab.id].length}
              </span>
            </button>
          )
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== activeTab}
          tabIndex={0}
          className="mt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-700 sm:mt-10"
        >
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {groups[tab.id].map((member, index) => (
              <MemberCard key={member.slug} member={member} index={index} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
