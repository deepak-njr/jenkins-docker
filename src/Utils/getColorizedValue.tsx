import { Typography } from 'antd';

export const getColoriezedValue = (value: string) => {
    let color = "#FFF5E9";
    let border = "#F39C12";
    if (value === "completed") {
        color = "#E5F9ED";
        border = "#30CB83";
    } else if (["deleted", "declined"].includes(value)) {
        color = "#FFEBEB";
        border = "#E74C3C";
    }
    if (value)
        return (
            <div
                style={{
                    borderRadius: 4,
                    padding: "2px 8px",
                    background: color,
                    border: `1px solid ${color}`,
                    width: "fit-content",
                }}
            >
                <Typography
                    style={{
                        textTransform: "capitalize",
                        textAlign: "center",
                        fontSize: 14,
                        color: border,
                    }}
                >
                    {value}
                </Typography>
            </div>
        );
};