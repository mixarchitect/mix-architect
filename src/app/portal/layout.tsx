import { AudioProvider } from "@/lib/audio-context";
import { PortalMiniPlayer } from "@/components/portal/portal-mini-player";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {children}
      <PortalMiniPlayer />
    </AudioProvider>
  );
}
