import { useContext } from 'react';
import './ProfileAbout.scss'
import { ProfileContext } from '../Profile';

function ProfileAbout() {
    const context = useContext(ProfileContext);

    return (
        <div className="profile-about-wrapper">
            <div className="profile-about">
                <h3>About</h3>

                <div className="profile-about-grid">
                    <div className="indicator-group">
                        <p className="counter">{context.profileData.followingsCount}</p>
                        <p className="title">following</p>
                    </div>

                    <div className="indicator-group">
                        <p className="counter">{context.profileData.followersCount}</p>
                        <p className="title">followers</p>
                    </div>

                    <div className="indicator-group">
                        <p className="counter">{context.profileData.postsCount}</p>
                        <p className="title">posts</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProfileAbout;