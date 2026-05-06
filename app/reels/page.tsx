import Image from 'next/image';
import { Instagram, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;
export const metadata = { title: 'Reels' };

export default async function ReelsPage() {
  const supabase = createClient();
  const { data: reels } = await supabase
    .from('reels')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  return (
    <div className="container py-16 lg:py-24">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Short-form content
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Reels
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-4">
        Bite-sized malware analysis snippets, technique demos, and quick tips —
        from the EpochZero Instagram channel.
      </p>
      <a
        href="https://www.instagram.com/epochzero.net"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-gold-500 hover:text-gold-400 mb-12"
      >
        <Instagram className="w-4 h-4" />
        Follow @epochzero.net
        <ExternalLink className="w-3 h-3" />
      </a>

      {!reels || reels.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            Reels coming soon. Follow on Instagram for updates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <a
              key={reel.id}
              href={reel.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative aspect-[9/16] overflow-hidden border border-navy-700 hover:border-gold-500 transition-colors"
            >
              {reel.thumbnail_url ? (
                <Image
                  src={reel.thumbnail_url}
                  alt={reel.caption ?? 'Reel'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center">
                  <Instagram className="w-12 h-12 text-gold-500/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />
              {reel.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-mono text-xs text-bone-100 line-clamp-2 leading-tight">
                    {reel.caption}
                  </p>
                </div>
              )}
              <div className="absolute top-3 right-3 w-7 h-7 bg-navy-950/80 border border-navy-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Instagram className="w-3.5 h-3.5 text-gold-500" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
