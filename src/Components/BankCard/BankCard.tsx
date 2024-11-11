import { InputProps } from "antd";
import { omit } from "lodash";
import MaskedInput from "react-text-mask";
import { AMERICANEXPRESS, CARDICON, OTHERCARDS } from "./Contants";

import styled from "styled-components";

function findDebitCardType(cardNumber: string) {
  const regexPattern: any = {
    MASTERCARD: /^5[1-5][0-9]{1,}|^2[2-7][0-9]{1,}$/,
    VISA: /^4[0-9]{2,}$/,
    AMERICAN_EXPRESS: /^3[47][0-9]{5,}$/,
    DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{3,}$/,
    DINERS_CLUB: /^3(?:0[0-5]|[68][0-9])[0-9]{4,}$/,
    JCB: /^(?:2131|1800|35[0-9]{3})[0-9]{3,}$/,
  };
  for (const card in regexPattern) {
    if (cardNumber.replace(/[^\d]/g, "").match(regexPattern[card])) return card;
  }
  return "";
}

const StyledCardComponent = styled.div`
  position: relative;
  .cardIcon {
    position: absolute;
    right: 0;
    top: 10px;
    margin-right: 10px;
  }
  .cardIcon svg {
    width: 30px;
  }
`;

export const BankCard = (props: InputProps) => {
  return (
    <StyledCardComponent>
      <MaskedInput
        mask={
          ["37", "34"].includes(
            props.value && (props.value as any).split("").splice(0, 2).join("")
          )
            ? AMERICANEXPRESS
            : OTHERCARDS
        }
        className="ant-input ant-input-lg"
        guide={false}
        {...omit(props, ["size", "prefix"])}
      />
      <span className="cardIcon">
        {props.value && CARDICON[findDebitCardType(props.value as string)]}
      </span>
    </StyledCardComponent>
  );
};
