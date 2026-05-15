import { useEffect } from 'react';
import { api } from '../api.js'
import { useAuthOverlayStore, useAuthStore } from '../stores/authStore.js';
import Login from "./Login.jsx";
import SignUp from "./SignUp.jsx";
import { useProfileStore } from '../stores/profileStore.js';
import { useQuery } from '@tanstack/react-query';
import PasswordRecovery from './PasswordRecovery.jsx';


async function getInstantData() {
	if (localStorage.getItem('accessToken')) {
		const meResponse = await api.get('auth/me');
		let profileResponse;
		if (meResponse.status === 200) {
			profileResponse = await api.get(`profile?userName=${meResponse.data.userName}`);
		}
    	return ({
			me:  meResponse.data,
			profile: profileResponse.data 
		})
	}
    return { me: null, profile: null }
}


function AuthOverlay() {
    const login = useAuthStore(store => store.login);

    const openedModal = useAuthOverlayStore(store => store.openedModal);
    const setOpenedModal = useAuthOverlayStore(store => store.setOpenedModal);

    const isOpened = useAuthOverlayStore(store => store.isOpened);
    const setIsOpened = useAuthOverlayStore(store => store.setIsOpened);

	const loginWithUser = useAuthStore(store => store.loginWithUser);
	const setProfileData = useProfileStore(store => store.setData);
	
	const user = useAuthStore(store => store.user);
	const token = useAuthStore(store => store.token);

	const { data, isLoading, error } = useQuery({
		queryKey: ["instant"],
		queryFn: () => getInstantData()
	})

    useEffect(() => {
        if (!data) return;
        
        if (data.me) {
            loginWithUser(data.me);
        }
        if (data.profile) {
            setProfileData(data.profile);
        }
    }, [data]);
    
	if (isLoading) return;
    if (error) return;

    
    return (
        <div className={isOpened ? 'auth-overlay opened' : 'auth-overlay'}
            onMouseDown={(e)=>{
                setIsOpened(false);
            }}>
            {
                openedModal == 'login' ?
            <Login 
                setOpenedModal={setOpenedModal} 
                isOpened={isOpened}
                setIsOpened={setIsOpened}/> :
            openedModal == 'signup' ?
            <SignUp 
                setOpenedModal={setOpenedModal} 
                isOpened={isOpened}
                setIsOpened={setIsOpened}/> :
            openedModal == 'passwordRecovery' ?
            <PasswordRecovery
                setOpenedModal={setOpenedModal} 
                isOpened={isOpened}
                setIsOpened={setIsOpened}/> :
            <></>
            }

        </div>
    );
}

export default AuthOverlay;