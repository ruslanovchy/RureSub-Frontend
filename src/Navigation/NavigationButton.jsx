import { useNavigate } from "react-router-dom";

function NavigationButton({ icon, text, navigateTo }) {
    const navigate = useNavigate();
    return (
        <button className="transparent-button navigation-button"
            onClick={() => {
                navigate(navigateTo);
            }}>
            <img src={icon} alt="" />
            <span>{text}</span>
        </button>
    )
}

export default NavigationButton;