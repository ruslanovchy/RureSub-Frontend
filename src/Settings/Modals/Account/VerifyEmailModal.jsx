import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './VerifyEmailModal.scss'
import { useAuthStore } from '../../../stores/authStore';
import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { loginRegex } from '../../../validation/authValidation';
import { api } from '../../../api';
import { notifyError, notifyPromise } from '../../../notification';
import { useProfileStore } from '../../../stores/profileStore';
import CodeInputs from '../../../Components/CodeInputs';

const COUNT = 6;

function VerifyEmailModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const profileData = useProfileStore(store => store.data);
    const setProfileData = useProfileStore(store => store.setData);
    const meDetailedData = useSettingsStore(store => store.meDetailedData);
    const setMeDetailedData = useSettingsStore(store => store.setMeDetailedData);

    const [openedPage, setOpenedPage] = useState(0);    
    const [error, setError] = useState('');

    //#region second page

    const [seconds, setSeconds] = useState(60);
    const [code, setCode] = useState('');
    const [focusedInput, setFocusedInput] = useState(0);
    const [status, setStatus] = useState('idle');

    //#endregion

    useEffect(()=>{
        reload()
    }, [isOpened]);

    useEffect(() => {
        if (seconds <= 0) return;

        const timerId = setInterval(() => {
            setSeconds((prev) => prev - 1)
        }, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, [seconds])

    if (!meDetailedData) return null;

    function sendVerifyRequest() {
        const promise = api.post('auth/verify/emailrequest');

        promise.then(response => {
            setOpenedPage(1);
            setSeconds(60);
            setTimeout(()=>{
                setFocusedInput(0);
            }, 50)
        }).catch(error => {
            if (error.status === 429) {
                notifyError('Too many requests for sending verification code. Try later.');
            }
        });
    }

    function submit() {
        if (openedPage == 0) {
            sendVerifyRequest();
        }
        else {
            const formData = new FormData();
            formData.append('code', code);
            const promise = api.post('auth/verify/email', formData);

            promise.then(response => {
                if (response.status !== 200) return;
                setStatus('success');
                setTimeout(()=>{
                    setIsOpened(false);
                    setMeDetailedData({
                        ...meDetailedData,
                        isEmailVerified: true
                    })
                }, 1000)
            }).catch(error => {
                if (error.status === 403) {
                    setStatus('idle');
                    setTimeout(()=>{
                        setStatus('error');
                    }, 10);
                }
            })
        }
    }

    function reload() {
        setTimeout(()=>{
            setError('');
            setOpenedPage(0);
            setCode('');
            setStatus('idle');
        }, 200)
    }

    

    return (
        <div className="modal-card verify-email-modal">
            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <h3>Verify email</h3>
            {
                openedPage == 0 ?
                <div className="first-page">
                    <p>To ensure you can always regain access to your account, verify your email address today. This simple step guarantees you can receive secure password reset links whenever you need them.</p>
                </div> :
                <div className="second-page">
                    <p>
                        Enter code that was sent to {meDetailedData.email}
                        <br/>
                        { seconds > 0 ?
                        `Send again after ${seconds} seconds` :
                        <>
                            <span>
                                Did not receive code?
                            </span>
                            <span 
                                className='send-again-span'
                                onClick={()=>{
                                    sendVerifyRequest()
                                }}> Send again</span>
                        </>}
                    </p>
                    <CodeInputs
                        codeLength={COUNT}
                        code={code}
                        setCode={setCode}
                        focusedInput={focusedInput}
                        status={status}
                        setStatus={setStatus}/>
                    <p></p>
                </div>
            }
            
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
                    }}
                    disabled={openedPage != 0 && code.length <= COUNT - 1}>
                    {openedPage == 0 ? 'Send' : 'Check'}
                </button>
            </div>
        </div>
    )
}

export default VerifyEmailModal