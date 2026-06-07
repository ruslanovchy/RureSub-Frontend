import { useContext, useEffect, useState } from 'react';
import './ProfileAddInfo.scss'
import { ProfileContext } from '../Profile';

function ProfileAddInfo() {
    const context = useContext(ProfileContext);
    const [bioState, setBioState] = useState('clamped');

    const bio = context.profileData.bio;

    useEffect(() => {
        
    }, [])

    return (
        <div className="profile-add-info">
            <div className={`bio ${bio && bio.length > 0 ? '' : 'invisible'}`}
                onClick={()=>{
                    setBioState(bioState === 'clamped' ? 'expanded' : 'clamped')
                }}>
                <p className={`text ${bioState}`}>{bio}</p>
            </div>
        </div>
    )
}

export default ProfileAddInfo;