/** Strip rich-text HTML into plain script suitable for TTS. */
export function htmlToPlainScript(html: string): string {
  const withParagraphs = html.replace(/<\/p>/gi, "\n\n");
  const withBreaks = withParagraphs.replace(/<br\s*\/?>/gi, "\n");
  const stripped = withBreaks.replace(/<[^>]+>/g, "");
  const decoded = stripped
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return decoded
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Full scene script from all text lines (excludes sound/image effects). */
export function sceneTextLinesToScript(
  lines: Array<{ type?: string; html: string }>,
): string {
  const textLines = lines.filter((line) => !line.type || line.type === "text");
  return htmlToPlainScript(textLines.map((line) => line.html).join("\n\n"));
}
