import './ProfileAbout.scss'

function ProfileAbout() {
    return (
        <div className="profile-about-wrapper">
            <div className="profile-about">
                <h3>About</h3>

                <div className="profile-about-grid">
                    <div className="indicator-group">
                        <p className="counter">0</p>
                        <p className="title">following</p>
                    </div>

                    <div className="indicator-group">
                        <p className="counter">0</p>
                        <p className="title">followers</p>
                    </div>

                    <div className="indicator-group">
                        <p className="counter">0</p>
                        <p className="title">posts</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProfileAbout;