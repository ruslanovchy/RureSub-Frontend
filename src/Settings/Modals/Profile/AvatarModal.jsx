import { useSettingsOverlayStore } from '../../../stores/settingsOverlayStore';
import crossIcon from "../../../assets/icons/cross.svg"
import './AvatarModal.scss'
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

function AvatarModal() {
    const setIsOpened = useSettingsOverlayStore(store => store.setIsOpened);
    const isOpened = useSettingsOverlayStore(store => store.isOpened);
    const setOpenedModal = useSettingsOverlayStore(store => store.setOpenedModal);

    const profileData = useProfileStore(store => store.data);
    const setProfileData = useProfileStore(store => store.setData);
    
    const inputRef = useRef(null);

    const [avatarSrc, setAvatarSrc] = useState(profileData.avatarUrl);

    const [file, setFile] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);

    const [error, setError] = useState('');

    async function submit() {
        try {

            let newError = ''

            if (croppedAreaPixels.width > 5000 || croppedAreaPixels.height > 5000) {
                newError = 'Image is too big!'
            }

            const cropped = await getCroppedImg(file, croppedAreaPixels);
            setCroppedImage(cropped);

            if (!newError) {
                const formData = new FormData();

                formData.append('userId', profileData.userId);
                formData.append('newAvatar', cropped);

                const promise = api.patch('profile/avatar', formData);

                notifyPromise(promise, {
                    loading: 'Loading...',
                    success: 'Success!',
                    error: 'Error occured'
                });

                promise.then(response => {
                    setProfileData({ ...profileData, avatarUrl: response.data });
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

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, [])

    return (
        <div className="modal-card avatar-modal">
            <button className="close-button"
                onClick={()=>{
                    setIsOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>

            <h3>Avatar</h3>
            <p>Select new profile avatar</p>
            
            <input 
                type="file"
                accept='image/*'
                ref={inputRef}
                onChange={(e)=>{
                    if (e.target.files && e.target.files.length > 0) {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => { setFile(reader.result); setAvatarSrc(reader.result); });
                        reader.readAsDataURL(e.target.files[0]);
                    }
                }}/>
            
            {!file ?
                <div className="avatar-container">
                    <div className="image-group">
                        <img src={avatarSrc}
                            onError={() => { setAvatarSrc(assets.userDefaultAvatar); }} alt="" >
                        </img>
                        <div className="hover-overlay"
                            onClick={(e)=>{
                                if (inputRef.current)
                                inputRef.current.click();
                            }}>
                            <img src={penIcon} alt="" />
                        </div>
                    </div>
                </div> :
                <div className='cropper-container'>
                    <Cropper
                        image={file}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape='round'
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}/>
                </div>
            }
            
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

export default AvatarModal