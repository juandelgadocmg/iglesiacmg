interface VideoItem {
  id: string;
  titulo: string;
  youtube_url: string;
}

interface Props {
  videos: VideoItem[];
}

function getYoutubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.pathname.includes("/embed/")) return url;
  } catch {}
  return url;
}

export default function DashboardVideoSection({ videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <div className="space-y-3">
      {videos.map(v => (
        <div key={v.id} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
            🎬 {v.titulo}
          </p>
          <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-muted">
            <iframe
              src={getYoutubeEmbedUrl(v.youtube_url)}
              title={v.titulo}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
