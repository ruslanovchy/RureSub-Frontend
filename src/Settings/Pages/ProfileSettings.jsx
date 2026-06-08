import { useEffect, useState } from 'react';
import { useProfileStore } from '../../stores/profileStore';
import ModalSetting from '../Components/ModalSetting';
import ToggleSetting from '../Components/ToggleSetting';
import './ProfileSettings.scss'
import { api } from '../../api';
import { notifyPromise } from '../../notification';
import { useSettingsStore } from '../../stores/settingsStore';

function ProfileSettings() {
    const profile = useSettingsStore(store => store.profileData);
    const setProfileData = useSettingsStore(store => store.setProfileData);
    const [showFollowers, setShowFollowers] = useState(profile?.showFollowers ?? false);
    const [showFollowings, setShowFollowings] = useState(profile?.showFollowings ?? false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (profile) {
            setShowFollowers(profile.showFollowers);
            setShowFollowings(profile.showFollowings);
        }

    }, [profile])

    function handleSetShowFollowers(value) {
        const formData = new FormData();

        formData.append('userId', profile.userId);
        formData.append('value', value);

        const promise = api.patch('profile/showfollowers', formData);

        notifyPromise(promise, {
            loading: 'Loading...',
            success: 'Success!',
            error: 'Error occured.'
        });

        promise.then(response => {
            if (response.status === 200) {
                setProfileData({...profile, showFollowers: value});
            }
        })
    }

    function handleSetShowFollowings(value) {
        const formData = new FormData();

        formData.append('userId', profile.userId);
        formData.append('value', value);

        const promise = api.patch('profile/showfollowings', formData);

        notifyPromise(promise, {
            loading: 'Loading...',
            success: 'Success!',
            error: 'Error occured.'
        });

        promise.then(response => {
            if (response.status === 200) {
                setProfileData({...profile, showFollowings: value});
            }
        })
    }

    return (
        <div className="settings-page profile-settings">
            <h2>Profile</h2>
            <ModalSetting
                settingName='Display name'
                description={'Change your name for displaying. Won\'t change your username'}
                modalName='displayName'/>

            <ModalSetting
                settingName='Bio'
                description={'Edit your bio or personal description'}
                modalName='bio'/>
            
            <ModalSetting
                settingName='Avatar'
                description={'Edit your avatar or upload a new image'}
                modalName='avatar'/>
            
            <ModalSetting
                settingName='Banner'
                description={'Upload a profile background image'}
                modalName='banner'/>

            <ToggleSetting
                checked={showFollowers}
                setChecked={handleSetShowFollowers}
                settingName='Show followers'
                description={'Show followers count to other users'}/>

            <ToggleSetting
                checked={showFollowings}
                setChecked={handleSetShowFollowings}
                settingName='Show followings'
                description={'Show followings count to other users'}/>

        </div>
    )
}

export default ProfileSettings;