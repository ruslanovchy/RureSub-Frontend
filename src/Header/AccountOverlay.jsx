import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import logoutIcon from '../assets/icons/logout.png';
import profileSettingsIcon from '../assets/icons/profile-settings.png';
import settingsIcon from '../assets/icons/settings.png';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useRef } from 'react';
import { useAccountOverlayStore } from '../stores/accountOverlayStore';
import { useProfileStore } from '../stores/profileStore';

function AccountOverlay({ ref }) {
    const navigate = useNavigate();
    const logoutZustand = useAuthStore(store => store.logout);
    const user = useAuthStore(store => store.user);
    const setProfileData = useProfileStore(store => store.setData);

	function logout() {
		const promise = api.post('auth/logout');

		logoutZustand();
        setIsOpened(false);
        setProfileData(null);
	}

    const overlayRef = useRef(null);
    
    const isOpened = useAccountOverlayStore(store => store.isOpened);
    const setIsOpened = useAccountOverlayStore(store => store.setIsOpened);

    return (
        <div ref={ref} className={`account-overlay ${isOpened ? 'opened' : ''}`}>
            <OverlayButton 
                icon={profileSettingsIcon} 
                text='Profile'
                onClick={()=>{navigate(`/user/${user.userName}`); setIsOpened(false);}}/>

            <OverlayButton 
                icon={settingsIcon} 
                text='Settings'
                onClick={()=>{navigate(`/settings/account`); setIsOpened(false);}}/>

            <div className="separator"></div>
            <OverlayButton 
                icon={logoutIcon} 
                text='Logout'
                onClick={()=>{ logout(); setIsOpened(false); }}/>
        </div>
    )
}

function OverlayButton({ icon, text, onClick }) {

    return (
        <button className="transparent-button"
            onClick={onClick}>
            <img src={icon} alt="" />
            <span>{text}</span>
        </button>
    )
}

export default AccountOverlay;