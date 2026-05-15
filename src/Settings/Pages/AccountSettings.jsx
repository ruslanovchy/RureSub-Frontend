import { useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import ModalSetting from '../Components/ModalSetting';
import './AccountSettings.scss'

function AccountSettings() {
    const meDetailedData = useSettingsStore(store => store.meDetailedData);

    if (!meDetailedData) return null;

    return (
        <div className="settings-page profile-settings">
            <h2>Account</h2>

            <ModalSetting
                settingName='Change email'
                description='Set a new email'
                modalName='changeEmail'/>

            {!meDetailedData.isEmailVerified && 
            <ModalSetting
                settingName='Verify email'
                description='You have to verify email for security purposes.'
                modalName='verifyEmail'/>}
        </div>
    )
}

export default AccountSettings;