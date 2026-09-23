export async function translateToIndonesian(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  const encoded = encodeURIComponent(text.trim());
  const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|id`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Translation API failed");
  const data = await res.json();
  return data?.responseData?.translatedText || text;
}