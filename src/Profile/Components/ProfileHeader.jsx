import { useContext } from "react";
import { ProfileContext } from "../Profile";
import defaultAvatar from '../../assets/user-default-avatar.png'
import defaultBanner from '../../assets/user-default-banner.jpg'
import penIcon from '../../assets/icons/pen.svg'
import './ProfileHeader.scss'
import { useNavigate } from "react-router-dom";

function ProfileHeader() {
    const navigate = useNavigate();
    const context = useContext(ProfileContext);
    
    return (
        <div className='profile-header'>
            <img className='banner' src={context.profileData.bannerUrl ?? defaultBanner} alt="" />
            <div className="main-info">
                <div className="avatar">
                    <img className='avatar-image' src={
                        !context.profileData.avatarUrl ? defaultAvatar : context.profileData.avatarUrl
                    } alt="" />
                </div>

                <div className="names">
                    <p className="display-name-p">
                        {context.profileData.displayName}
                    </p>
                    
                    <p className="user-name-p">
                        @{context.profileData.userName}
                    </p>
                </div>
                {context.isProfileOwner && 
                <div className="additional-buttons">
                    <button className="change-profile-button"
                        onClick={()=>{
                            navigate('/settings/profile')
                        }}>
                        <img src={penIcon} alt="" />
                    </button>
                </div>}
                
            </div>
        </div>
    )
}

export default ProfileHeader;