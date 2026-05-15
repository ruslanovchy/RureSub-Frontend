import { useEffect, useState } from "react";
import appleIcon from "../assets/icons/apple.svg"
import googleIcon from "../assets/icons/google.webp"
import { notifyError, notifyPromise, notifySuccess } from "../notification";
import { emailRegex, loginRegex, passwordRegex } from "../validation/authValidation";
import { api } from "../api";
import { useAuthStore } from "../stores/authStore";

function SignUp({ setOpenedModal, isOpened, setIsOpened }) {
    const doLogin = useAuthStore(store => store.login);

    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatedPassword, setRepeatedPassword] = useState('');

    const [errors, setErrors] = useState({});

    function submit() {
        const newErrors = {};

        if (!loginRegex.test(login)) {
            newErrors.login = 'Invalid login! Your login must contain between 3 and 30 Latin characters.';
        }

        if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email.';
        }

        if (!passwordRegex.test(password)) {
            newErrors.password = 'Invalid password.';
        }

        if (repeatedPassword !== password) {
            newErrors.repeatedPassword = 'Passwords don\'t match.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length == 0) {
            const formData = new FormData();

            formData.append('name', login);
            formData.append('email', email);
            formData.append('password', password);

            const promise = api.post('auth/signup', formData);
            notifyPromise(promise, {
                loading: 'Loading'
            });

            promise.then((response)=>{
                if (response.status !== 200)
                    return;

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
                if (error.response == null)
                    return;

                const status = error.response.status;
                if (status === 409) {
                    notifyError('User with same login or email already exists!');
                }
                else {
                    notifyError('Error occured while signing up!');
                }
            });
        }
    }

    useEffect(()=>{
        setTimeout(()=>{
            setLogin('');
            setEmail('');
            setPassword('');
            setRepeatedPassword('');
        }, 200)
    }, [isOpened])

    return (
        <div className="login-card modal-card"
            onMouseDown={(e)=>{
                e.stopPropagation();
            }}>

            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <svg rpl="" fill="currentColor" height="16" icon-name="close" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.273 10l5.363-5.363a.9.9 0 10-1.273-1.273L10 8.727 4.637 3.364a.9.9 0 10-1.273 1.273L8.727 10l-5.363 5.363a.9.9 0 101.274 1.273L10 11.273l5.363 5.363a.897.897 0 001.274 0 .9.9 0 000-1.273L11.275 10h-.002z"></path>
                </svg>
            </button>

            <p className='modal-header'>Sign Up</p>

            <div className="form">

                <input type="text" placeholder='Enter login'
                    className={errors.login && 'error'}
                    value={login}
                    onChange={(e)=>{setLogin(e.target.value)}}/>
                {errors.login && <p className="error">{errors.login}</p>}
                
                <input type="text" placeholder='Enter email' 
                    className={errors.email && 'error'}
                    value={email}
                    onChange={(e)=>{setEmail(e.target.value)}}/>
                {errors.email && <p className="error">{errors.email}</p>}

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

                <div className='separator'>or</div>
                <button className="auth-service-button">
                    <img src={googleIcon} />
                    Continue With Google
                </button>
                <button className="auth-service-button">
                    <img src={appleIcon} />
                    Continue With Apple
                </button>

                <p>Already subber? <a  onClick={(e)=> {
                    e.preventDefault();
                    setOpenedModal('login');
                }}>Login</a></p>

                <button className="primary-button"
                    onClick={()=> {
                        submit();
                    }}>
                    Sign Up
                </button>

            </div>
        </div> 
    )
}

export default SignUp;