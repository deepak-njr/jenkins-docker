import { times } from "lodash";
import moment from "moment";

const months = (count: number = 12) => {
  const monthData = times(count, (i) =>
    i === 0
      ? moment().format("MMM YY")
      : moment(moment().add(-i, "month")).format("MMM YY")
  );

  return monthData.reverse();
};
const weekOfMonth = (input = moment()) => {
  const firstDayOfMonth = input.clone().startOf("month");
  const firstDayOfWeek = firstDayOfMonth.clone().startOf("week");

  const offset = firstDayOfMonth.diff(firstDayOfWeek, "days");
  return {
    month: input.format("MMM"),
    weekNum: Math.ceil((input.date() + offset) / 7),
  };
};

const week = times(12, (i) =>
  i === 0
    ? `W${weekOfMonth(moment().subtract(3, "month")).weekNum}(${
        weekOfMonth(moment().subtract(3, "month")).month
      })`
    : `W${
        weekOfMonth(
          moment()
            .subtract(3, "month")
            .add(i * 7, "days")
        ).weekNum
      }(${
        weekOfMonth(
          moment()
            .subtract(3, "month")
            .add(i * 7, "days")
        ).month
      })`
);

const year = () => {
  const data = times(10, (i) =>
    i === 0
      ? moment().format("YYYY")
      : moment(moment().subtract(i, "year")).format("YYYY")
  );

  return data.reverse();
};
interface Props {
  categories: string[];
  monthCount?: number;
  type: "Monthly" | "Weekly" | "Yearly";
}
export const getRamdomData = ({ categories, type, monthCount = 12 }: Props) => {
  const data: any = [];
  // eslint-disable-next-line array-callback-return
  if (type === "Monthly") {
    months(monthCount).map((month) => {
      // eslint-disable-next-line array-callback-return
      data.push({
        name: month,
        ...Object.assign(
          {},
          ...categories.map((cat) => ({
            [cat]: Math.floor(10000 + Math.random() * 90000),
          }))
        ),
        // ...flatMap(categories, (cat) => ({
        //   [cat]: Math.floor(10000 + Math.random() * 90000),
        // })),
      });
    });
  } else if (type === "Weekly") {
    week.map((wk: string) => {
      data.push({
        name: wk,
        ...Object.assign(
          {},
          ...categories.map((cat) => ({
            [cat]: Math.floor(10000 + Math.random() * 90000),
          }))
        ),
      });
    });
  } else {
    year().map((yr) => {
      // eslint-disable-next-line array-callback-return
      data.push({
        name: yr,
        ...Object.assign(
          {},
          ...categories.map((cat) => ({
            [cat]: Math.floor(10000 + Math.random() * 90000),
          }))
        ),
      });
    });
  }
  return data;
};
