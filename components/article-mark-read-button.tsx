'use client';
import { useState } from 'react';
import { CheckCircle2, Loader2, BookOpenCheck } from 'lucide-react';

interface Props {
  articleId: string;
  initialRead: boolean;
}

export function ArticleMarkReadButton({ articleId, initialRead }: Props) {
  const [read, setRead] = useState(initialRead);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (read || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/progress/article/read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId }),
      });
      if (res.ok) setRead(true);
    } finally {
      setLoading(false);
    }
  }

  if (read) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: 'rgba(27,124,62,0.10)', color: '#22c55e', border: '1px solid rgba(27,124,62,0.30)' }}>
        <CheckCircle2 className="w-4 h-4" /> Marked as read
      </div>
    );
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-primary disabled:opacity-60">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpenCheck className="w-4 h-4" />}
      Mark as read
    </button>
  );
}
