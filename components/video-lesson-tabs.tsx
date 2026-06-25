// components/video-lesson-tabs.tsx
'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Beaker, Globe, ListChecks } from 'lucide-react';

interface Props {
  lessonContent:  string;
  steps:          Array<{ title: string; description?: string; timestamp_seconds?: number }>;
  referencesList: Array<{ title: string; url: string; source_type?: string; note?: string }>;
  exercises:      Array<{ title: string; description: string; difficulty?: string }>;
  youtubeId:      string;
}

// Tab colors match the Q1-Q4 domain colour system used across the platform
const SECTIONS = [
  { id: 'lesson-content-mdx', label: 'Lesson',     icon: BookOpen,  color: '#1B5FA8' },
  { id: 'lab-notes',          label: 'Lab Notes',  icon: Beaker,    color: '#8B5E1A' },
  { id: 'references',         label: 'References', icon: Globe,     color: '#1B7C3E' },
  { id: 'exercises',          label: 'Exercises',  icon: ListChecks,color: '#6B3AD4' },
];

export function VideoLessonTabs({
  lessonContent, steps, referencesList, exercises,
}: Props) {
  const [active, setActive] = useState<string>('lesson-content-mdx');

  const available: Record<string, boolean> = {
    'lesson-content-mdx': lessonContent.trim().length > 0,
    'lab-notes':          steps.length > 0,
    'references':         referencesList.length > 0,
    'exercises':          exercises.length > 0,
  };

  // Highlight tab as user scrolls into each section
  useEffect(() => {
    const ids = SECTIONS.map(s => s.id).filter(id => available[id]);
    const observers: IntersectionObserver[] = [];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        entries => { entries.forEach(e => { if (e.isIntersecting) setActive(id); }); },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
    setActive(id);
  };

  return (
    <nav
      className="sticky top-16 z-30 -mx-6 px-6 py-3 backdrop-blur-md"
      style={{
        background:   'hsl(var(--surface) / 0.96)',
        borderTop:    '1px solid hsl(var(--border))',
        borderBottom: '1px solid hsl(var(--border))',
      }}
    >
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(({ id, label, icon: Icon, color }) => {
          const on  = available[id];
          const act = active === id && on;

          return (
            <button
              key={id}
              onClick={() => on && handleClick(id)}
              disabled={!on}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                font-sans text-xs font-semibold transition-all duration-150"
              style={
                act ? {
                  // Active: solid coloured pill
                  background:  color,
                  color:       '#fff',
                  border:      `1px solid ${color}`,
                } : on ? {
                  // Available: outlined pill
                  background:  `${color}12`,
                  color:       color,
                  border:      `1px solid ${color}50`,
                } : {
                  // Unavailable: muted, no interaction
                  background:  'hsl(var(--muted))',
                  color:       'hsl(var(--foreground-subtle))',
                  border:      '1px solid hsl(var(--border))',
                  opacity:     0.45,
                  cursor:      'not-allowed',
                }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
