export function aspectName(id: string) {
  return id
    .replaceAll('-', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
