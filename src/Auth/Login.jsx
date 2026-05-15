import { useEffect, useState } from "react";
import appleIcon from "../assets/icons/apple.svg"
import googleIcon from "../assets/icons/google.webp"
import crossIcon from "../assets/icons/cross.svg"
import { emailRegex, loginRegex, passwordRegex } from "../validation/authValidation";
import { api } from "../api";
import { notifyError, notifyPromise, notifySuccess } from "../notification";
import { useAuthStore } from "../stores/authStore";

function Login({ setOpenedModal, isOpened, setIsOpened }) {
    const doLogin = useAuthStore(store => store.login);

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState({});

    function submit() {
        const newErrors = {};

        if (!loginRegex.test(login) && !emailRegex.test(login)) {
            newErrors.login = 'Invalid login or email.';
        }

        if (!passwordRegex.test(password)) {
            newErrors.password = 'Invalid password.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const formData = new FormData();

            formData.append('login', login);
            formData.append('password', password);

            const promise = api.post('auth/login', formData);

            notifyPromise(promise, {
                loading: 'Loading...'
            });

            promise.then(response => {
                if (response.data) {
                    if (response.data.token && response.data.user) {
                        doLogin(response.data.token, response.data.user);
                    }
                }

                setIsOpened(false);
                setTimeout(() => {
                    location.href = '/'
                }, 500)
            })
            .catch(error => {
                const status = error.status;

                if (status === 403 || status == 404) {
                    notifyError('Wrong login or password!');
                }
            });
        }
    }

    useEffect(()=>{
        setTimeout(()=>{
            setLogin('');
            setPassword('');
        }, 200)
    }, [isOpened])

    return (
        <div className="login-card modal-card"
            onMouseDown={(e)=>{
                e.stopPropagation();
            }}>
            <p className='modal-header'>Login</p>

            <div className="form">
                
                <button className="close-button"
                    onClick={()=>{
                        setIsOpened(false);
                    }}>
                    <img src={crossIcon} alt="" />
                </button>

                <input 
                    type="text" placeholder='Enter login or email'
                    className={errors.login && 'error'}
                    value={login}
                    onChange={(e)=>{setLogin(e.target.value)}} />
                {errors.login && <p className="error">{errors.login}</p>}

                <input 
                    type="password" placeholder='Enter password'
                    className={errors.password && 'error'}
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}} />
                {errors.password && <p className="error">{errors.password}</p>}

                <div className='separator'>or</div>
                <button className="auth-service-button">
                    <img src={googleIcon} />
                    Continue With Google
                </button>
                <button className="auth-service-button">
                    <img src={appleIcon} />
                    Continue With Apple
                </button>
                <a onClick={(e)=>{setOpenedModal('passwordRecovery');}}>Forgot password?</a>
                <p>New to RureSub? <a  onClick={(e)=> {
                    e.preventDefault();
                    setOpenedModal('signup');
                }}>Sign up</a></p>
                <button className="primary-button"
                    onClick={()=>{submit()}}>
                    Login
                </button>

            </div>
        </div>
    )
}

export default Login;