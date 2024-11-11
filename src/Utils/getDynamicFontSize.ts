import { RefObject } from "react";
interface Props {
  ref: RefObject<any>;
  relativeParentPercent: number;
}
export const getDynamicFontSize = ({ ref, relativeParentPercent }: Props) => {
  if (ref.current) {
    return ref.current.getBoundingClientRect().width * relativeParentPercent >
      40
      ? ref.current.getBoundingClientRect().width * relativeParentPercent
      : 40;
  } else {
    return 20;
  }
};
