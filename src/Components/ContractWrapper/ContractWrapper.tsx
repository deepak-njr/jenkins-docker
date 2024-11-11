import { Icon } from "@iconify/react";
import { ReactNode } from "react";
import { ExpansionPanel, WrapperCard } from "~/Components";
// import styles from "./ApplicationOnboarding.module.scss";
import { useNavigate } from "react-router-dom";

export const ContractWrapper = ({
  children,
  isExpanstionPanel,
  styles,
  showEdit,
  contractTitle = "",
  title = "",
}: {
  children: ReactNode;
  contractTitle: string;
  title: string;
  styles: any;
  showEdit: boolean;
  isExpanstionPanel: boolean;
}) => {
  const navigate = useNavigate();

  if (!isExpanstionPanel) {
    return (
      <ExpansionPanel title={contractTitle}>
        <>{children}</>
      </ExpansionPanel>
    );
  } else {
    if (showEdit) {
      return (
        <WrapperCard
          title={title}
          smallHeader
          action={
            <Icon
              icon="carbon:edit"
              style={{
                color: styles.strawberry,
                cursor: "pointer",
                fontSize: 20,
                verticalAlign: "middle",
              }}
              onClick={() =>
                navigate("/applications/onboarding/application-details", {
                  state: {
                    from: "/applications/onboarding/review",
                    edit: true,
                    contractEdit: true,
                  },
                })
              }
            />
          }
        >
          {children}
        </WrapperCard>
      );
    } else {
      return (
        <WrapperCard
          title={title}
          smallHeader
        >
          {children}
        </WrapperCard>
      );
    }
  }
};
