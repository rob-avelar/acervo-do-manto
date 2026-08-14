// Converte uma URL de imagem do Yupoo para passar pelo nosso proxy,
// que adiciona o Referer correto e contorna o bloqueio de hotlink.
export function proxied(url: string): string {
  if (!url) return url;
  if (!url.includes("photo.yupoo.com")) return url;
  return `/api/img?u=${encodeURIComponent(url)}`;
}
