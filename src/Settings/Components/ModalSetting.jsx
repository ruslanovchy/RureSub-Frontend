import './ModalSetting.scss'
import arrowRightIcon from '../../assets/icons/arrow-right.svg'
import { useSettingsOverlayStore } from '../../stores/settingsOverlayStore';

function ModalSetting({ settingName, description, modalName }) {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);
    return (
        <div className="modal-setting-wrapper"
            onClick={()=> {
                setIsOpened(true);
                setOpenedModal(modalName);
            }}>
            <div className="setting-main-info">
                <p className='setting-name'>{settingName}</p>
                <p className='setting-description'>{description}</p>
            </div>

            <div className="arrow-container">
                <img src={arrowRightIcon} alt="" />
            </div>
        </div>
    )
}

export default ModalSetting;