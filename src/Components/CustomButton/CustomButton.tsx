import { Button, ButtonProps} from "antd";


export const CustomButton = (props: ButtonProps) => {
  const { value, style } = props;

  const buttonProps = {
    ...props,
    style: {
      minWidth: '96px',
      height: '40px',
      ...style,
    },  };

  return (
    <div>
      <Button {...buttonProps}>{value}</Button>
    </div>
  );
};