import NavigationButton from './NavigationButton';
import './Navigation.scss';
import homeIcon from '../assets/icons/home.svg';
import searchIcon from '../assets/icons/search.svg';
import newsIcon from '../assets/icons/news.svg';
import binocularsIcon from '../assets/icons/binoculars.svg';
import plusIcon from '../assets/icons/plus.svg';
import bellIcon from '../assets/icons/bell.svg';
import { useNavigationStore } from '../stores/navigationStore';

function Navigation() {
    const isSidebarOpened = useNavigationStore(store => store.isSidebarOpened);
    const setIsSidebarOpened = useNavigationStore(store => store.setIsSidebarOpened);

    return (
        <>
            <div 
                className={`navigation-overlay ${isSidebarOpened ? 'opened' : ''}`}
                onClick={()=>{setIsSidebarOpened(!isSidebarOpened)}}>

            </div>

            <div className={`navigation ${isSidebarOpened ? 'opened' : ''}`}
                onClick={(e)=>e.stopPropagation()}>

                <div className="elements">

                    <NavigationButton 
                        icon={homeIcon}
                        text='Home'
                        navigateTo='/'/>
                    
                    <NavigationButton 
                        icon={searchIcon}
                        text='Search'
                        navigateTo='/search'/>
                    
                    <NavigationButton 
                        icon={newsIcon}
                        text='News'
                        navigateTo='/news'/>
                    
                    <NavigationButton 
                        icon={binocularsIcon}
                        text='Explore'
                        navigateTo='/explore'/>
                    
                    <div className="separator"></div>

                    
                    <NavigationButton 
                        icon={plusIcon}
                        text='Create'
                        navigateTo='/create'/>

                    <NavigationButton 
                        icon={bellIcon}
                        text='Notifications'
                        navigateTo='/notifications'/>
                </div>
            </div>
        </>
        
    )
}

export default Navigation;