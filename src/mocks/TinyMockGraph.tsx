import { TinyArea, TinyAreaConfig } from "@ant-design/plots";
import moment from "moment";

export const TinyMockGraph = ({ color }: { color: string }) => {
  const config: TinyAreaConfig = {
    height: 40,
    autoFit: true,
    data: Array.from({ length: moment().daysInMonth() }, () =>
      Math.floor(Math.random() * 40)
    ),
    smooth: true,
    padding: 5,
    areaStyle: {
      fill: color,
      fillOpacity: 0.05,
    },
    appendPadding: 2,
    line: {
      color,
    },
  };
  return <TinyArea {...config} renderer="svg" />;
};
