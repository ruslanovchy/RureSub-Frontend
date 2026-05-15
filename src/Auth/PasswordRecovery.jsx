import { useEffect, useState } from "react";
import appleIcon from "../assets/icons/apple.svg"
import googleIcon from "../assets/icons/google.webp"
import crossIcon from "../assets/icons/cross.svg"
import { emailRegex, loginRegex, passwordRegex } from "../validation/authValidation";
import { api } from "../api";
import { notifyError, notifyPromise, notifySuccess } from "../notification";
import { useAuthStore } from "../stores/authStore";
import CodeInputs from "../Components/CodeInputs";

const COUNT = 6;

function PasswordRecovery({ setOpenedModal, isOpened, setIsOpened }) {
    const [openedPage, setOpenedPage] = useState('');
    
    const [email, setEmail] = useState('');

    const [errors, setErrors] = useState({});

    //#region secondPage

    const [seconds, setSeconds] = useState(60);
    const [code, setCode] = useState('');
    const [focusedInput, setFocusedInput] = useState(0);
    const [status, setStatus] = useState('idle');

    //#endregion

    //#region thirdPage

    const [password, setPassword] = useState('');
    const [repeatedPassword, setRepeatedPassword] = useState('');

    //#endregion

    function sendVerifyRequest() {
        const formData = new FormData();

        formData.append('email', email);
        const promise = api.post('auth/verify/recoveryrequest', formData);

        notifyPromise(promise, {
            loading: 'Loading...'
        });

        promise.then(response => {
            if (response.status !== 200) return;
            setOpenedPage(1);
            setSeconds(60);
            setTimeout(()=>{
                setFocusedInput(0);
            }, 50)
        })

        .catch(error => {
            const status = error.status;

            if (status === 403) {
                notifyError('Entered email is not verified!');
            }
            else if (status == 404) {
                notifyError('Account with entered email not found!');
            }
        });
    }

    function submit() {
        const newErrors = {};

        if (openedPage == 0) {
            if (!emailRegex.test(email)) {
                newErrors.login = 'Invalid email.';
            }

            if (Object.keys(newErrors).length === 0) {
                sendVerifyRequest();
            }
        }
        else if (openedPage == 1) {
            if (code.length !== COUNT) return;

            const formData = new FormData();

            formData.append('email', email);
            formData.append('code', code);

            const promise = api.post('auth/verify/recoverycodecheck', formData);

            promise.then(response => {
                if (response.status !== 200) return;
                setStatus('success');
                setTimeout(()=>{
                    setOpenedPage(2);
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
        else if (openedPage == 2) {
            if (!passwordRegex.test(password)) {
                newErrors.password = 'Invalid password.';
            }

            if (password !== repeatedPassword) {
                newErrors.repeatedPassword = 'Passwords don\'t match.';
            }

            if (Object.keys(newErrors).length === 0) {
                const formData = new FormData();

                formData.append('email', email);
                formData.append('code', code);
                formData.append('newPassword', password);

                const promise = api.patch('auth/verify/recover', formData);

                notifyPromise(promise, {
                    loading: 'Loading...',
                    error: 'Error occured!',
                    success: 'Success!'
                });

                promise.then(response => {
                    setTimeout(()=>{
                        setOpenedModal('login');
                    }, 1000)
                });
            }
        }


        setErrors(newErrors);
    }

    useEffect(()=>{
        setTimeout(()=>{
            reload();
        }, 200)
    }, [isOpened])

    useEffect(() => {
        if (seconds <= 0) return;

        const timerId = setInterval(() => {
            setSeconds((prev) => prev - 1)
        }, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, [seconds]);

    function reload() {
        setSeconds(60);
        setCode('');
        setEmail('');
    }

    return (
        <div className="modal-card recovery-card"
            onMouseDown={(e)=>{
                e.stopPropagation();
            }}>
            <p className='modal-header'>Recovery</p>
            <button className="close-button"
                onClick={()=>{
                    setOpenedModal('login');
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <div className="form">
                <div className="top">
                    {
                        openedPage == 0 ?
                        <>
                        <input 
                            type="text" placeholder={'Enter your account\'s email'}
                            className={errors.login && 'error'}
                            value={email}
                            onChange={(e)=>{setEmail(e.target.value)}} />
                        {errors.login && <p className="error">{errors.login}</p>}
                        </> :
                        openedPage == 1 ?
                        <>
                            <p>
                                Enter code that was sent to {email}
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
                        </> :
                        <>
                            <p>Enter new password for your account.</p>

                            <input type="password" placeholder='Enter password'  
                                className={errors.password && 'error'}
                                value={password}
                                onChange={(e)=>{setPassword(e.target.value)}}/>
                            {errors.password && <p className="error">{errors.password}</p>}

                            <input type="password" placeholder='Repeat password'  
                                className={errors.repeatedPassword && 'error'}
                                value={repeatedPassword}
                                onChange={(e)=>{setRepeatedPassword(e.target.value)}}/>
                            {errors.repeatedPassword && <p className="error">{errors.repeatedPassword}</p>}
                        </>
                    }
                </div>

                <button className="primary-button"
                    onClick={()=>{submit()}}
                    disabled={openedPage != 0 && code.length <= COUNT - 1}>
                    Next
                </button>
            </div>
        </div>
    )
}

export default PasswordRecovery;