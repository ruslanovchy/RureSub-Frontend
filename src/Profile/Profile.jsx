import './Profile.scss'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { createContext } from 'react'
import ProfileHeader from './Components/ProfileHeader'
import ProfileAddInfo from './Components/ProfileAddInfo'
import ProfileAbout from './Components/ProfileAbout'

export const ProfileContext = createContext();

const fetchUser = async (userName) => {
    const res = await api.get(`profile?userName=${userName}`);
    return res.data;
}

function Profile() {
    const params = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['user', params.userName],
        queryFn: () => fetchUser(params.userName)
    });

    const user = useAuthStore(store => store.user);

    if (isLoading) {
        return;
    }

    if (error) {
        return;
    }
    
    const isProfileOwner = user ? data.userId == user.id : false;

    const contextData = {
        profileData: data,
        isProfileOwner,
    }

    return (
        <div className="profile-wrapper">
            <ProfileContext.Provider value={contextData}>

            <div className='profile-container'>
                <ProfileHeader/>
                
                <div className='profile-body'>
                    <div className="profile-body-left">
                        <ProfileAddInfo/>
                        <div></div>
                    </div>
                    <ProfileAbout/>
                </div>
            </div>

            </ProfileContext.Provider>
        </div>
    )
}

export default Profile;