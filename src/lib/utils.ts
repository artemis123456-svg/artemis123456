import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDecimal(value: string): number {
  const normalized = value.replace(',', '.');
  return parseFloat(normalized) || 0;
}

export function formatDecimal(num: number, decimals: number = 2): string {
  return num.toFixed(decimals).replace('.', ',');
}
