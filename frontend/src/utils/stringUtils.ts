export const capitalize = (str: string): string =>
  str ? str[0].toUpperCase() + str.slice(1) : str;

export const toTitleCase = (str: string): string => str.replace(/\w\S*/g, capitalize);