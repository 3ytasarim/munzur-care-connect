import { useEffect } from "react";

/** Keeps the compact round MunzurDestek mark as the browser favicon. */
export function DynamicFavicon() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = "/favicon.png";
  }, []);

  return null;
}
