import { Link, Outlet } from 'react-router-dom';
import './Settings.scss'
import DisplayNameModal from './Modals/Profile/DisplayNameModal';
import { useSettingsOverlayStore } from '../stores/settingsOverlayStore';
import { useEffect, useRef } from 'react';
import { api } from '../api';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import BioModal from './Modals/Profile/BioModal';
import AvatarModal from './Modals/Profile/AvatarModal';
import BannerModal from './Modals/Profile/BannerModal';
import ChangePasswordModal from './Modals/Security/ChangePasswordModal';
import VerifyEmailModal from './Modals/Account/VerifyEmailModal';
import ChangeEmailModal from './Modals/Account/ChangeEmailModal';

const pages = {
    'Account': '/settings/account',
    'Profile': '/settings/profile',
    'Security': '/settings/security'
}

async function getSettings(user) {
    const profileResponse = await api.get(`profile?userName=${user.userName}`);
    const meDetailedResponse = await api.get(`auth/medetailed`);
    
    return { 
        profileData: profileResponse.data,
        meDetailedData: meDetailedResponse.data,
     }
}

function Settings() {

    const user = useAuthStore(store => store.user);

    const { data, isLoading, error } = useQuery({
        queryKey: ['settings', user?.userName],
        queryFn: () => getSettings(user),
        enabled: !!user
    });

    const isOverlayOpened = useSettingsOverlayStore(store => store.isOpened);
    const setIsOverlayOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const overlayOpenedModal = useSettingsOverlayStore(store => store.openedModal);
    const setProfileData = useSettingsStore(store => store.setProfileData);
    const setMeDetailedData = useSettingsStore(store => store.setMeDetailedData);

    const overlayRef = useRef();

    useEffect(()=>{
        if (data?.profileData) setProfileData(data.profileData);
        if (data?.meDetailedData) setMeDetailedData(data.meDetailedData);
    }, [data])

    if (isLoading) return null;
    if (error) return null;

    function renderModal() {
        switch (overlayOpenedModal) {
            case 'displayName':
                return <DisplayNameModal/>
            case 'bio':
                return <BioModal/>
            case 'avatar':
                return <AvatarModal/>
            case 'banner':
                return <BannerModal/>
            case 'changePassword':
                return <ChangePasswordModal/>
            case 'verifyEmail':
                return <VerifyEmailModal/>
            case 'changeEmail':
                return <ChangeEmailModal/>
            default:
                return <></>
        }
    }
    

    return (
        <div className="settings-wraper">
            <div ref={overlayRef} className={`settings-overlay ${isOverlayOpened ? 'opened' : ''}`}
                onMouseDown={(e)=>{
                    if (e.target === overlayRef.current) {
                        setIsOverlayOpened(false)
                    }
                }}>
                {renderModal()}
            </div>
            <div className="settings-container">
                <h1>Settings</h1>
                <div className="settings-navigation">
                    {Object.keys(pages).map(key => {
                        return (
                            <SettingsLink
                                key={key}
                                pathName={key}
                                path={pages[key]}/>
                        )
                    })}
                </div>
                <Outlet/>
            </div>
        </div>
    )
}

function SettingsLink({ pathName, path }) {
    const selected = window.location.pathname === path;
    
    return (
        <Link to={path} className={selected ? 'selected' : undefined}>{pathName}</Link>
    )
}

export default Settings;