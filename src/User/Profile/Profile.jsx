import './Profile.scss'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api.js'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { createContext, useState } from 'react'
import ProfileHeader from './Components/ProfileHeader'
import ProfileAddInfo from './Components/ProfileAddInfo'
import ProfileAbout from './Components/ProfileAbout'
import PagesNavigation from './Components/Pages/PagesNavigation'
import Posts from './Components/Pages/Posts'
import Likes from './Components/Pages/Likes'

const pages = [
    'Posts',
    'Likes'
]

function Profile() {
    const [openedPage, setOpenedPage] = useState('Posts');

    function getCurrentPage() {
        switch (openedPage) {
            case 'Posts':
                return <Posts/>
            case 'Likes':
                return <Likes/>
            default:
                return <></>
        }
    }

    return (
        <div className="profile-wrapper">

            <div className='profile-container'>
                <ProfileHeader/>
                
                <div className='profile-body'>
                    <div className="profile-body-left">
                        <ProfileAddInfo/>
                        <PagesNavigation
                            pages={pages}
                            openedPage={openedPage}
                            setOpenedPage={setOpenedPage}/>
                        {getCurrentPage()}
                        <div></div>
                        <br />
                    </div>
                    <ProfileAbout/>
                </div>
            </div>

        </div>
    )
}

export default Profile;