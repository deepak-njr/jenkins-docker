import { Skeleton, Space } from "antd";
import { times } from "lodash";

interface Props {
  rows: number;
}

export const SkeletonRow = ({ rows }: Props) => {
  return (
    <Space
      direction="vertical"
      size={"large"}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {times(rows).map((i) => (
        <Skeleton.Input
          key={`skeleton-row-${i}`}
          active={true}
          size="small"
          block
        />
      ))}
    </Space>
  );
};
