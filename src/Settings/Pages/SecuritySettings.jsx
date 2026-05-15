import ModalSetting from '../Components/ModalSetting';
import './SecuritySettings.scss'

function SecuritySettings() {
    return (
        <div className="settings-page security-settings">
            <h2>Security</h2>
            <ModalSetting
                settingName='Change password'
                description='Set a new password'
                modalName='changePassword'/>
        </div>
    )
}

export default SecuritySettings;