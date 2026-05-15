import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './DisplayNameModal.scss'
import { useAuthStore } from '../../../stores/authStore';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { loginRegex } from '../../../validation/authValidation';
import { api } from '../../../api';
import { notifyPromise } from '../../../notification';
import { useProfileStore } from '../../../stores/profileStore';

function DisplayNameModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const profileData = useProfileStore(store => store.data);
    const setProfileData = useProfileStore(store => store.setData);
    
    const [displayName, setDisplayName] = useState(profileData.displayName);

    const [error, setError] = useState('');

    function submit() {
        let newError = ''
        if (!loginRegex.test(displayName)) {
            newError = 'Invalid display name!';
        }

        if (!newError) {
            const formData = new FormData();

            formData.append('userId', profileData.userId);
            formData.append('newName', displayName);

            const promise = api.patch('profile/name', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                success: 'Success!',
                error: 'Error occured'
            });

            promise.then(response => {
                setProfileData({ ...profileData, displayName: displayName });
                setIsOpened(false);
            });
        }

        setError(newError);
    }

    function reload() {
        setTimeout(()=>{
            setError('');
            setDisplayName(profileData.displayName);
        }, 200)
    }

    useEffect(()=>{
        reload()
    }, [isOpened]);

    return (
        <div className="modal-card display-name-modal">
            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <h3>DisplayName</h3>
            <p>Enter new display name</p>
            
            <input 
                type="text" 
                className={`secondary-input ${!!error ? 'error' : ''}`} value={displayName}
                onChange={(e)=>{
                    setDisplayName(e.target.value);
                    setError('');
                }} 
                placeholder='Display name'/>
            
            {error && <p className="error">{error}</p>}
            <div className="buttons">
                <button 
                    className='secondary-button small'
                    onClick={()=>{
                        setIsOpened(false);
                    }}>
                    Cancel
                </button>

                <button 
                    className='primary-button small'
                    onClick={()=>{
                        submit();
                    }}>
                    Save
                </button>
            </div>
        </div>
    )
}

export default DisplayNameModal