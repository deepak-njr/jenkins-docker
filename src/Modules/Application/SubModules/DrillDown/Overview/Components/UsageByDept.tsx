import { WrapperCard, PieChart } from "@components/index";

export const UsageByDept = () => {
  return (
    <WrapperCard title={"Department - Usage / Spend"}>
      <PieChart
        data={[
          {
            category: "Marketing",
            value: 8000,
            additionInfo: "12 users",
          },
          {
            category: "Finance",
            value: 100,
            additionInfo: "75 users",
          },
          {
            category: "IT",
            value: 1000,
            additionInfo: "45 Users",
          },
          {
            category: "Design",
            value: 1000,
            additionInfo: "4 Users",
          },
          {
            category: "Others",
            value: 18000,
            additionInfo: "45 Users",
          },
        ]}
        tooltipTitle="Usage"
        pieCenterContent={{
          title: "Spend(YTD)",
        }}
        isCurrency
      />
    </WrapperCard>
  );
};
