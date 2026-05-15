import './ToggleSetting.scss'
import arrowRightIcon from '../../assets/icons/arrow-right.svg'
import Toggle from '../../Components/Toggle';
import { useRef, useState } from 'react';

function ToggleSetting({ checked, setChecked, settingName, description, onChange }) {

    const wrapperRef = useRef();
    const toggleRef = useRef();
    return (
        <div
            ref={wrapperRef}
            className="toggle-setting-wrapper"
            onClick={(e)=>{
                if ((e.target === wrapperRef.current || 
                    wrapperRef.current.contains(e.target)) &&
                    e.target !== toggleRef.current &&
                    !toggleRef.current.contains(e.target)) {
                    //setChecked(!checked);
                    setChecked(!checked);
                    console.log('wrapper');
                }
                    
            }}>
            <div className="setting-main-info">
                <p className='setting-name'>{settingName}</p>
                <p className='setting-description'>{description}</p>
            </div>

            <div className="toggle-container">
                <Toggle
                    ref={toggleRef}
                    id={settingName}
                    checked={checked}
                    setChecked={setChecked}/>
            </div>
        </div>
    )
}

export default ToggleSetting;