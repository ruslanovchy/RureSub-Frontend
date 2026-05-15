import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './ChangePasswordModal.scss'
import { useAuthStore } from '../../../stores/authStore';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { loginRegex, passwordRegex } from '../../../validation/authValidation';
import { api } from '../../../api';
import { notifyError, notifyPromise } from '../../../notification';
import { useProfileStore } from '../../../stores/profileStore';

function ChangePasswordModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatedNewPassword, setRepeatedNewPassword] = useState('');

    const [error, setError] = useState({});

    function submit() {
        let newError = {}
        if (!passwordRegex.test(newPassword)) {
            newError.newPassword = 'Invalid password!';
        }
        if (newPassword !== repeatedNewPassword) {
            newError.repeatedNewPassword = 'Passwords don\'t match!';
        }

        if (Object.keys(newError).length === 0) {
            const formData = new FormData();

            formData.append('oldPassword', oldPassword);
            formData.append('newPassword', newPassword);

            const promise = api.patch('auth/change/password', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                success: 'Success!'
            });

            promise.then(response => {
                setIsOpened(false);
            })
            .catch(error => {
                if (error.status === 403) {
                    notifyError('Wrong old password!');
                }
                else {
                    notifyError('Error occured!');
                }
            });
        }

        setError(newError);
    }

    function reload() {
        setTimeout(()=>{
            setError('');
            setOldPassword('');
            setNewPassword('');
            setRepeatedNewPassword('');
        }, 200)
    }

    useEffect(()=>{
        reload()
    }, [isOpened]);

    return (
        <div className="modal-card change-password-modal">
            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <h3>Change password</h3>
            <p>Enter old and new passwords</p>
            
            <div className="inputs">
                <input 
                    type="password" 
                    className={`secondary-input old-password-input ${!!error.oldPassword ? 'error' : ''}`} 
                    value={oldPassword}
                    onChange={(e)=>{
                        setOldPassword(e.target.value);
                        setError('');
                    }} 
                    placeholder='Old password'/>
                {error.oldPassword && <p className="error">{error.oldPassword}</p>}

                <input 
                    type="password" 
                    className={`secondary-input ${!!error.newPassword ? 'error' : ''}`} 
                    value={newPassword}
                    onChange={(e)=>{
                        setNewPassword(e.target.value);
                        setError('');
                    }} 
                    placeholder='New password'/>
                {error.newPassword && <p className="error">{error.newPassword}</p>}
                
                <input 
                    type="password" 
                    className={`secondary-input ${!!error.repeatedNewPassword ? 'error' : ''}`} 
                    value={repeatedNewPassword}
                    onChange={(e)=>{
                        setRepeatedNewPassword(e.target.value);
                        setError('');
                    }} 
                    placeholder='Repeat new password'/>
                {error.repeatedNewPassword && <p className="error">{error.repeatedNewPassword}</p>}
            </div>
            
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

export default ChangePasswordModal