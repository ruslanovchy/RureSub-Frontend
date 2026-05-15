import { useEffect, useState } from 'react';
import './Toggle.scss'

function Toggle({ ref, checked, setChecked, onChange, id, ...props}) {
    const [isChanging, setIsChanging] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(()=>{
        if (isInitialized) {
            setTimeout(()=>{
                setIsChanging(false);
            }, 200);
            setIsChanging(true);
        }
        setIsInitialized(true);
    }, [checked])

    return (
        <label ref={ref} htmlFor={id} className={`switch ${isChanging ? 'changing' : ''}`}>
            <input 
                id={id} 
                type="checkbox"
                checked={checked}
                onClick={()=>{
                    setChecked(!checked);
                    console.log('toggle');
                }}
                onChange={()=>{}}
                {...props} />
            <span className="slider"></span>
        </label>
    )
}

export default Toggle;