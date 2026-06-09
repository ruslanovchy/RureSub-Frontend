import { useNavigate } from 'react-router-dom';
import PagesNavigation from './Components/PagesNavigation';
import './Subscriptions.scss'
import Followers from './Components/Pages/Followers';
import Followings from './Components/Pages/Followings';

const pages = [
    'Followings',
    'Followers',
]

function Subscriptions({ page }) {
    const navigate = useNavigate();

    function getPageComponent() {
        switch (page) {
            case 'Followers':
                return <Followers/>
            case 'Followings':
                return <Followings/>
        }
    }

    return (
        <div className="subscriptions-wrapper">
            <div className="subscriptions-container">
                <PagesNavigation
                    pages={pages}
                    openedPage={page}
                    setOpenedPage={(page) => {
                        navigate(`../${page.toLowerCase()}`)
                    }}/>

                <br />

                {getPageComponent()}
            </div>
        </div>
    )
}

export default Subscriptions;