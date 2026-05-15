import { useIsFetching } from "@tanstack/react-query";
import './LoadingBar.scss'
import { useEffect, useState } from "react";

function LoadingBar() {
    const isFetching = useIsFetching();
    const [barWidth, setBarWidth] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isFetching) {
            setBarWidth(24);
            setVisible(true);
        }
        else {
            setBarWidth(100);

            const timeout = setTimeout(() => {
                setBarWidth(0);
                setVisible(false);
            }, 300)

            return () => {
                clearTimeout(timeout);
            }
        }
    }, [isFetching])

    return (
        <div className={`loading-bar`}
            style={{
                width: `${barWidth}%`,
                opacity: visible ? '1' : '0'
            }}>

        </div>
    )
}

export default LoadingBar;