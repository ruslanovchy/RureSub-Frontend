import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './BannerModal.scss'
import { useAuthStore } from '../../../stores/authStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { loginRegex } from '../../../validation/authValidation';
import { api } from '../../../api';
import { notifyPromise } from '../../../notification';
import penIcon from '../../../assets/icons/pen.svg';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/canvasUtils';
import { useProfileStore } from '../../../stores/profileStore';
import { assets } from '../../../assets/assets';

function BannerModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const profileData = useProfileStore(store => store.data);
    const setProfileData = useProfileStore(store => store.setData);
    
    const inputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [rawFile, setRawFile] = useState(null);

    const [error, setError] = useState('');

    async function submit() {
        try {

            let newError = ''

            if (!newError) {
                const formData = new FormData();

                formData.append('userId', profileData.userId);
                formData.append('newBanner', rawFile);

                const promise = api.patch('profile/banner', formData);

                notifyPromise(promise, {
                    loading: 'Loading...',
                    success: 'Success!',
                    error: 'Error occured'
                });

                promise.then(response => {
                    setProfileData({ ...profileData, bannerUrl: response.data });
                    setIsOpened(false);
                    setFile(null);
                });
            }

            setError(newError);
        }
        catch (e) {
            console.error(e);
        }
    }

    function reload() {
        setTimeout(()=>{
            setError('');
        }, 200)
    }

    useEffect(()=>{
        reload()
    }, [isOpened]);

    useEffect(() => {
        if (profileData) {
            setBannerSrc(profileData?.bannerUrl ?? assets.userDefaultBanner);
        }
    }, [profileData])

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, [])

    const [bannerSrc, setBannerSrc] = useState(profileData.bannerUrl);

    return (
        <div className="modal-card banner-modal">
            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <h3>Banner</h3>
            <p>Select new profile banner</p>
            
            <input 
                type="file"
                accept='image/*'
                ref={inputRef}
                onChange={(e)=>{
                    if (e.target.files && e.target.files.length > 0) {
                        setRawFile(e.target.files[0]);
                        const reader = new FileReader();
                        reader.addEventListener('load', () => { setFile(reader.result); setBannerSrc(reader.result); });
                        reader.readAsDataURL(e.target.files[0]);
                    }
                }}/>
            
            <div className="banner-container">
                <div className="image-group">
                    <img src={bannerSrc} alt="" 
                        onError={() => setBannerSrc(assets.userDefaultBanner)}>
                    </img>
                    <div className="hover-overlay"
                        onClick={(e)=>{
                            if (inputRef.current)
                            inputRef.current.click();
                        }}>
                        <img src={penIcon} alt="" />
                    </div>
                </div>
            </div> 
            
            {error && <p className="error">{error}</p>}

            <div className="buttons">
                <button 
                    className='secondary-button small'
                    onClick={()=>{
                        if (file) {
                            setFile(null);
                        }
                        else {
                            setIsOpened(false);
                        }
                    }}>
                    Cancel
                </button>

                <button 
                    className='primary-button small'
                    onClick={()=>{
                        submit();
                    }}
                    disabled={file ? false : true}>
                    Save
                </button>
            </div>
        </div>
    )
}

export default BannerModal