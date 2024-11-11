export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}
export function getTimeDifference(time1: number, time2: number, unit: "seconds" | "minutes"): number {
  const diff = Math.abs(time1 - time2);
  const factor = unit === "seconds" ? 1000 : 60000;

  return Math.floor(diff / factor);
}
export function numberToWord(number: number): string {
  if (number < 0 || number > 100) {
    return `${number}`;
  }

  const ones = [
    "zero",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  number++;

  if (number < 20) {
    return ones[number].charAt(0).toUpperCase() + ones[number].slice(1);
  }

  const digit = number % 10;
  const ten = Math.floor(number / 10);

  return `${tens[ten]}${digit === 0 ? "" : "-" + ones[digit].charAt(0).toUpperCase() + ones[digit].slice(1)}`;
}

export const sortString = (a: any, b: any, fieldName: string) => {
  a[fieldName] = a[fieldName] ? a[fieldName] : "";
  b[fieldName] = b[fieldName] ? b[fieldName] : "";
  const fieldA = a[fieldName].toUpperCase(); // ignore upper and lowercase
  const fieldB = b[fieldName].toUpperCase(); // ignore upper and lowercase
  // const fieldA = a[fieldName].trim(); // case sensitive
  // const fieldB = b[fieldName].trim(); // case sensitive
  if (fieldA < fieldB) {
    return -1;
  }
  if (fieldA > fieldB) {
    return 1;
  }
  return 0;
};
