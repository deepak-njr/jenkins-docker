import { Avatar, List, Skeleton, Space } from "antd";
import { times } from "lodash";

interface Props {
  rows: number;
}

export const SkeletonList = ({ rows }: Props) => {
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
        <Skeleton loading={true} active avatar>
          <List.Item.Meta
            avatar={<Avatar src={""} />}
            title={""}
            description={""}
          />
        </Skeleton>
      ))}
    </Space>
  );
};
