import { ColumnChart, WrapperCard } from "@components/index";
import { flatten, map } from "lodash";
import { useEffect, useState } from "react";

import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { useParams } from "react-router-dom";

export const Budget = () => {
  const [data, setData] = useState<any>([]);
  const { openToast } = useNotification();
  const { id } = useParams();

  useEffect(() => {
    get(`v1/department/budget/analytics?deptId=${id}`)
      .then((res: any) => {
        setData(res.response.data);
      })
      .catch((err) => openToast({ content: err, type: "error" }));
  }, []);

  return (
    <WrapperCard
      title={"Budget"}
      // action={
      //   <ButtonGroup
      //     buttonItems={["Weekly", "Monthly", "Yearly"]}
      //     onClick={(e, name) => setCurrentSelection(name)}
      //     defaultActive={currentSelection}
      //   />
      // }
    >
      <ColumnChart
        data={flatten(
          map(
            data.data,
            (values: { spend: any; remaining: any; month: any }) => ({
              Allocated: data.allocatedAmount,
              Spend: values.spend,
              Remaining: values.remaining,
              name: values.month,
            })
          )
        )}
        hasBarGap
        isCurrency
      />
    </WrapperCard>
  );
};
