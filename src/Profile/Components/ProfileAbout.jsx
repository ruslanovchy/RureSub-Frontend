import { useContext } from 'react';
import './ProfileAbout.scss'
import { ProfileContext } from '../Profile';
import { toIndicatorFormat } from '../../utils/indicatorFormat';
import { toShortDateFormat } from '../../utils/dateFormat';

function ProfileAbout() {
    const context = useContext(ProfileContext);
    console.log(context);
    return (
        <div className="profile-about-wrapper">
            <div className="profile-about">
                <h3>About</h3>

                <div className="profile-about-grid"> 
                    {
                        !!context.profileData.showFollowings &&
                        <div className="indicator-group">
                            <p className="counter">{toIndicatorFormat(context.profileData.followingsCount)}</p>
                            <p className="title">followings</p>
                        </div>
                    }

                    {
                        !!context.profileData.showFollowers &&
                        <div className="indicator-group">
                            <p className="counter">{toIndicatorFormat(context.profileData.followersCount)}</p>
                            <p className="title">followers</p>
                        </div>
                    }

                    <div className="indicator-group">
                        <p className="counter">{toIndicatorFormat(context.profileData.postsCount)}</p>
                        <p className="title">posts</p>
                    </div>

                </div>

                <div className="additional-info">
                    <br />

                    <div className="indicator-group">
                        <p className="counter">{toShortDateFormat(context.profileData.postsCount)}</p>
                        <p className="title">created at</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileAbout;