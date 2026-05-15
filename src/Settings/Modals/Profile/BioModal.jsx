import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './BioModal.scss'
import { useAuthStore } from '../../../stores/authStore';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { loginRegex } from '../../../validation/authValidation';
import { api } from '../../../api';
import { notifyPromise } from '../../../notification';
import { bioRegex } from '../../../validation/profileValidation';
import { useProfileStore } from '../../../stores/profileStore';

function BioModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const profileData = useProfileStore(store => store.data);
        const setProfileData = useProfileStore(store => store.setData);
    
    const [bio, setBio] = useState(profileData.bio);

    const [error, setError] = useState('');

    function submit() {
        let newError = ''
        
        if (!bioRegex.test(bio)) {
            newError = 'Invalid bio!';
        }

        if (!newError) {
            const formData = new FormData();

            formData.append('userId', profileData.userId);
            formData.append('newBio', bio);

            const promise = api.patch('profile/bio', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                success: 'Success!',
                error: 'Error occured'
            });

            promise.then(response => {
                setProfileData({ ...profileData, bio: bio });
                setIsOpened(false);
            });
        }

        setError(newError);
    }

    function reload() {
        setTimeout(()=>{
            setError('');
            setBio(profileData.bio);
        }, 200)
    }

    useEffect(()=>{
        reload()
    }, [isOpened]);

    return (
        <div className="modal-card bio-modal">
            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <h3>Bio</h3>
            <p>Enter new bio</p>
            
            <textarea 
                type="text" 
                className={`secondary-input ${!!error ? 'error' : ''}`} value={bio}
                onChange={(e)=>{
                    setBio(e.target.value);
                    setError('');
                }} 
                placeholder='Bio'/>
            
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

export default BioModal