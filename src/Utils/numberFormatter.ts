export const numberFormat = (
  value: number,
  notation: Intl.NumberFormatOptions["notation"] = "compact"
): string => {
  return Intl.NumberFormat("en", { notation }).format(value);
};
