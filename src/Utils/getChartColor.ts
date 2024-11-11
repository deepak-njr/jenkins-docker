import styles from "@styles/variables.module.scss";

export const getChartColors = (count: number) => {
  const chartcolors = Object.fromEntries(
    Object.entries(styles).filter(([key, value]) => key.includes("chartColor"))
  );

  const colorValues = Object.values(chartcolors);

  return count > colorValues.length ? colorValues : colorValues.slice(0, count);
};
