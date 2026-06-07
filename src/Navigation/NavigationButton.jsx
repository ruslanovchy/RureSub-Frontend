import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "../stores/navigationStore";
import { useCheckAuthorize } from "../hooks/useAuthorizeCheck";

function NavigationButton({ icon, text, navigateTo, checkAuthorize = false }) {
    const navigate = useNavigate();
    const doCheckAuthorize = useCheckAuthorize();
    const setIsSidebarOpened = useNavigationStore(store => store.setIsSidebarOpened);
    return (
        <button className="transparent-button navigation-button"
            onClick={() => {
                if (checkAuthorize && !doCheckAuthorize()) return;
                navigate(navigateTo);
                setIsSidebarOpened(false);
            }}>
            <img src={icon} alt="" />
            <span>{text}</span>
        </button>
    )
}

export default NavigationButton;