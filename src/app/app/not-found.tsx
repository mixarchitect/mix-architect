import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: "color-mix(in srgb, var(--muted) 15%, transparent)" }}>
        <FileQuestion className="w-6 h-6 text-muted" />
      </div>
      <h2 className="text-lg font-semibold text-text">{t("title")}</h2>
      <p className="text-sm text-muted max-w-md">
        {t("description")}
      </p>
      <Link href="/app">
        <Button variant="primary">{t("backToDashboard")}</Button>
      </Link>
    </div>
  );
}
