import { AudioProvider } from "@/lib/audio-context";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}
