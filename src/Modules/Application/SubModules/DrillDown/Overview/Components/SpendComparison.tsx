import { WrapperCard, ButtonGroup, ColumnChart } from "@components/index";
import { useState } from "react";

import { getRamdomData } from "~/mocks/getRandomColChartData";
export const SpendComparison = () => {
  const [currentSelection, setCurrentSelection] = useState("Monthly");
  return (
    <WrapperCard
      title={"Actual Spend Vs Estimated Cost"}
      action={
        <ButtonGroup
          buttonItems={["Weekly", "Monthly", "Yearly"]}
          defaultActive={currentSelection}
          onClick={(e, name) => setCurrentSelection(name)}
        />
      }
    >
      <ColumnChart
        data={getRamdomData({
          categories: ["Actual Spend", "Estimated Cost"],
          type: currentSelection as any,
        })}
        columnWidth={15}
      />
    </WrapperCard>
  );
};
