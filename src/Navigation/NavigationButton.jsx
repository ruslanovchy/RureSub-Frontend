import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "../stores/navigationStore";

function NavigationButton({ icon, text, navigateTo }) {
    const navigate = useNavigate();
    const setIsSidebarOpened = useNavigationStore(store => store.setIsSidebarOpened);
    return (
        <button className="transparent-button navigation-button"
            onClick={() => {
                navigate(navigateTo);
                setIsSidebarOpened(false);
            }}>
            <img src={icon} alt="" />
            <span>{text}</span>
        </button>
    )
}

export default NavigationButton;