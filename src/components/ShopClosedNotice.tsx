"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShopStatus } from "@/lib/shopStatus";

/** Shown in place of anything buyable while the shop is closed. */
export default function ShopClosedNotice({ status }: { status: ShopStatus }) {
  const locale = useLocale();
  const t = useTranslations("ShopPage");

  const message =
    status.message[locale]?.trim() ||
    status.message.en?.trim() ||
    t("closedDefault");

  return (
    <div className="border border-line p-8 text-center">
      <h2>{t("closedTitle")}</h2>
      <p className="measure mx-auto whitespace-pre-line">{message}</p>
    </div>
  );
}
