import { OperatorType } from "@/lib/types";

export const getCondition = (operator: OperatorType, value: string, parameter?: string) => {
    switch (operator) {
      case "AND":
        return value && parameter ? true : false; // Both values must be truthy
      case "OR":
        return value || parameter ? true : false; // At least one value must be truthy
      case "NOT":
        return !value; // Negates the truthiness of the value
      case "EQ":
        return value === parameter;
      case "NEQ":
        return value !== parameter;
      case "GT":
        return Number(value) > Number(parameter);
      case "LT":
        return Number(value) < Number(parameter);
      case "GTE":
        return Number(value) >= Number(parameter);
      case "LTE":
        return Number(value) <= Number(parameter);
      case "ISNULL":
        return value === null || value === undefined;
      case "ISNOTNULL":
        return value !== null && value !== undefined;
      case "CONTAINS":
        return typeof value === "string" && parameter && value.includes(parameter);
      case "LENGTH":
        return typeof value === "string" && Number(parameter) === value.length;
      case "STARTSWITH":
        return typeof value === "string" && parameter && value.startsWith(parameter);
      case "ENDSWITH":
        return typeof value === "string" && parameter && value.endsWith(parameter);
      default:
        return false;
    }
  };
  