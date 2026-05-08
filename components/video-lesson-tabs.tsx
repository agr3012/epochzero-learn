'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Beaker, Globe, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  lessonContent: string;
  steps: Array<{ title: string; description?: string; timestamp_seconds?: number }>;
  referencesList: Array<{ title: string; url: string; source_type?: string; note?: string }>;
  exercises: Array<{ title: string; description: string; difficulty?: string }>;
  youtubeId: string;
}

const SECTIONS = [
  { id: 'lesson-content-mdx', label: 'Lesson', icon: BookOpen },
  { id: 'lab-notes', label: 'Lab Notes', icon: Beaker },
  { id: 'references', label: 'References', icon: Globe },
  { id: 'exercises', label: 'Exercises', icon: ListChecks },
];

export function VideoLessonTabs({
  lessonContent,
  steps,
  referencesList,
  exercises,
}: Props) {
  const [active, setActive] = useState<string>('lesson-content-mdx');

  // Build availability map
  const available: Record<string, boolean> = {
    'lesson-content-mdx': lessonContent.trim().length > 0,
    'lab-notes': steps.length > 0,
    references: referencesList.length > 0,
    exercises: exercises.length > 0,
  };

  // Highlight tab as user scrolls past sections
  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id).filter((id) => available[id]);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(id);
          });
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: 'smooth' });
    setActive(id);
  };

  return (
    <nav className="sticky top-16 z-30 -mx-6 px-6 py-3 bg-navy-900/95 backdrop-blur-md border-y border-navy-700">
      <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wider">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isAvailable = available[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => isAvailable && handleClick(id)}
              disabled={!isAvailable}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 border transition-colors',
                isActive && isAvailable
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : isAvailable
                  ? 'border-gold-500/40 text-bone-100 hover:border-gold-500 hover:text-gold-500'
                  : 'border-navy-700 text-bone-300 opacity-40 cursor-not-allowed'
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
