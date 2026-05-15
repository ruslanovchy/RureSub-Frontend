import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './ChangeEmailModal.scss'
import { useAuthStore } from '../../../stores/authStore';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { emailRegex, loginRegex } from '../../../validation/authValidation';
import { api } from '../../../api';
import { notifyPromise } from '../../../notification';
import { useProfileStore } from '../../../stores/profileStore';

function ChangeEmailModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const meDetailedData = useSettingsStore(store => store.meDetailedData);
    const setMeDetailedData = useSettingsStore(store => store.setMeDetailedData);
    
    const [email, setEmail] = useState(meDetailedData.email);

    const [error, setError] = useState('');

    function submit() {
        let newError = ''
        if (!emailRegex.test(email)) {
            newError = 'Invalid email!';
        }

        if (email === meDetailedData.email) {
            setIsOpened(false);
        }

        if (!newError) {
            const formData = new FormData();

            formData.append('newEmail', email);

            const promise = api.patch('auth/change/email', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                success: 'Success!',
                error: 'Error occured'
            });

            promise.then(response => {
                setMeDetailedData({ ...meDetailedData, email: email, isEmailVerified: false });
                setIsOpened(false);
            });
        }

        setError(newError);
    }

    function reload() {
        setTimeout(()=>{
            setError('');
            setEmail(meDetailedData.email);
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

            <h3>Email</h3>
            <p>Enter new email. <br/>After changing you must verify new email.</p>
            
            <input 
                type="text" 
                className={`secondary-input ${!!error ? 'error' : ''}`} value={email}
                onChange={(e)=>{
                    setEmail(e.target.value);
                    setError('');
                }} 
                placeholder='Email'/>
            
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

export default ChangeEmailModal