import { icons } from "../assets/icons/icons";
import { useOverlayStore } from "./overlayStore";
import './Overlay.scss'
import { useEffect, useRef, useState } from "react";

function Overlay() {
    const overlayData = useOverlayStore(store => store.data);
    const setOverlayData = useOverlayStore(store => store.setData);

    const [overlayDisplayData, setOverlayDisplayData] = useState(null);

    useEffect(() => {
        if (overlayData) {
            setOverlayDisplayData(overlayData);
        }
        else {
            setTimeout(() => {
                setOverlayDisplayData(overlayData);
            }, 200)
        }
    }, [overlayData])

    const overlayRef = useRef(null);

    return (
        <div
            className={`overlay ${overlayData ? 'opened' : ''}`}
            ref={overlayRef}
            onClick={(e) => {
                if (e.target === overlayRef.current) {
                    setOverlayData(null);
                }
            }}>
            <div className={`modal-card ${overlayDisplayData?.modal?.className ?? ''}`}>
                <button className="close-button"
                    onClick={()=>{
                        setOverlayData(false);
                    }}>
                    <img src={icons.crossIcon} alt="" />
                </button>
                {overlayDisplayData?.title && <h3>{overlayDisplayData.title}</h3>}
                <div className="text-content">
                    {
                        overlayDisplayData?.textContent && 
                        (
                            Array.isArray(overlayDisplayData.textContent) 
                            ?
                                overlayDisplayData.textContent.map((row, index) =>
                                <p>{row}</p>)
                            :
                            <p>{overlayDisplayData.textContent}</p>
                        )
                    }
                    {
                        overlayDisplayData?.htmlContent &&
                        (overlayDisplayData?.htmlContent())
                    }
                </div>
                {
                    overlayDisplayData?.buttons &&
                    <div className="buttons">
                        {
                            overlayDisplayData?.buttons.map((b, i) => {
                                return (
                                    <button
                                        key={`${i} ${b.className} ${b.textContent}`}
                                        className={b.className}
                                        onClick={b.onClick}>
                                        {b.textContent}
                                    </button>
                                )
                            })
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default Overlay;