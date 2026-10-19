// Convierte el nombre de la partida en un slug para la URL:
// minúsculas, sin acentos, espacios por guiones. "Revisión 32" -> "revision-32".
export function toGameSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}
