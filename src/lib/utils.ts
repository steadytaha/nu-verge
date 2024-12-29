import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPropertiesFromDatabase(response: any) {
  if (!response?.properties) {
    return [];
  }

  return Object.entries(response.properties)
    .map(([key, value]: [string, any]) => {
      if (value.type === "checkbox" || value.select?.options) {
        return {
          key,
          options: value.select?.options || null,
          type: value.type,
        };
      }
      return null;
    })
    .filter(Boolean) // Remove null values
    .sort((a, b) => (a?.type === "checkbox" ? 1 : -1));
}
