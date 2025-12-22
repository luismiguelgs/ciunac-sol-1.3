import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileExtension(url: string): string | null {
  const match = url.match(/\.([a-zA-Z0-9]+)(?=\?|$)/);
  return match ? match[1] : null;
}
export function obtenerPeriodo() {
  const fechaActual = new Date();
  const mes = fechaActual.getMonth() + 1; // Los meses en JavaScript van de 0 a 11, por lo que sumamos 1 para obtener el mes actual
  const año = fechaActual.getFullYear();

  // Formatear los valores para que tengan dos dígitos si es necesario
  const mesFormateado = String(mes).padStart(2, '0');

  return `${String(año)}${mesFormateado}`
}
export const isPdf = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Fast extension-based checks
  if (lower.endsWith('.pdf')) return true;
  if (lower.includes('.pdf?')) return true;
  // Heuristics for Google Drive and similar
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const pathname = u.pathname.toLowerCase();
    const exportParam = u.searchParams.get('export')?.toLowerCase();
    // Google Drive: uc?export=download -> PDF (descarga)
    if (host === 'drive.google.com') {
      if (exportParam === 'download') return true;
      if (pathname.endsWith('/download')) return true;
    }
    // Generic: any URL indicating explicit download intent
    if (exportParam === 'download') return true;
    if (pathname.endsWith('/download')) return true;
    if (lower.includes('=download')) return true;
    // Fallback: path extension
    if (pathname.endsWith('.pdf')) return true;
  } catch {
    // ignore URL parse errors
  }
  return false;
}