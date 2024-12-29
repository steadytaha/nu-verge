import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPropertiesFromDatabase(response: any) {
  if (response?.properties) {
    const properties = response.properties;
    const propertiesArray = Object.entries(properties)
      .map(([key, value]: any) => {
        const select = value.select;
        if (select?.options || value.type === "checkbox") {
          return {
            key,
            options: select?.options || null,
            type: value.type,
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    
    return propertiesArray;
  }
}
