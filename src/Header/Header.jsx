import { useEffect, useRef, useState } from 'react';
import { useAuthOverlayStore, useAuthStore } from '../stores/authStore';
import './Header.scss'
import userDefaultAvatar from '../assets/user-default-avatar.png'
import { api } from '../api';
import { notifyPromise, notifySuccess } from '../notification';
import AccountOverlay from './AccountOverlay';
import menuIcon from '../assets/icons/menu.svg'
import { useNavigationStore } from '../stores/navigationStore';
import { useAccountOverlayStore } from '../stores/accountOverlayStore';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../stores/profileStore';

function Header({ overlayRef }) {
    const navigate = useNavigate();
    const isAuthorized = useAuthStore(store => store.isAuthorized);

    const openedModal = useAuthOverlayStore(store => store.openedModal);
    const setOpenedModal = useAuthOverlayStore(store => store.setOpenedModal);

    const isOpened = useAuthOverlayStore(store => store.isOpened);
    const setIsModalOpened = useAuthOverlayStore(store => store.setIsOpened);

	const [openedHeaderButtons, setOpenedHeaderButtons] = useState();

    const headerRef = useRef(null);

    const isSidebarOpened = useNavigationStore(store => store.isSidebarOpened);
    const setIsSidebarOpened = useNavigationStore(store => store.setIsSidebarOpened);

	useEffect(() => {
		if (isAuthorized === null) {
			setOpenedHeaderButtons(localStorage.getItem('accessToken') ? 'authorized' : 'unauthorized');
		}
		else {
			setOpenedHeaderButtons(isAuthorized ? 'authorized' : 'unauthorized');
		}
	}, [isAuthorized])

    const isAccountOverlayOpened = useAccountOverlayStore(store => store.isOpened);
	const setIsAccountOverlayOpened = useAccountOverlayStore(store => store.setIsOpened);

    const profileData = useProfileStore(store => store.data);

    useEffect(() => {
        const handleClick = (e) => {
            if (overlayRef.current.contains(e.target) || headerRef.current.contains(e.target)) {
                return;
            }
            setIsAccountOverlayOpened(false);
        }

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        }
    }, []);

    return (
        <div className='header' ref={headerRef}>
            <div className='logo-container'>
                <button className="sidebar-button transparent-button"
                    onClick={()=>{setIsSidebarOpened(!isSidebarOpened)}}>
                    <img src={menuIcon} alt="" />
                </button>
                <span 
                    className="logo"
                    onClick={()=> {navigate('/')}}>
                    RureSub
                </span>
            </div>
            <div className="search-container">
            </div>
            <div className="buttons-container">
                <div className={`unauthorized-buttons ${openedHeaderButtons === 'unauthorized'  ? 'opened' : ''}`}>
                    <button 
                        className='primary-button'
                        onClick={()=>{
                            setOpenedModal('login');
                            setIsModalOpened(true);
                        }}>
                        Login
                    </button>
                </div>

                <div className={`authorized-buttons ${openedHeaderButtons === 'authorized' ? 'opened' : ''}`}>
                    <button className="profile-button"
                        onClick={()=> {setIsAccountOverlayOpened(!isAccountOverlayOpened)}}>
                        <img src={
                                !profileData || !profileData.avatarUrl ? userDefaultAvatar : profileData.avatarUrl
                            } alt="" />
                    </button>

                </div>
            </div>
        </div>
    );
}

export default Header;