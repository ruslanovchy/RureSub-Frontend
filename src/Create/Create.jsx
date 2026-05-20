import { useState } from 'react';
import './Create.scss'
import { bodyTextRegex, titleRegex } from '../validation/postValidation';
import LengthIndicator from '../Components/LengthIndicator';
import ErrorIndicator from '../Components/ErrorIndicator';
import { api } from '../api';
import { notifyPromise } from '../notification';
import TipTap from '../Components/TipTap/TipTap.jsx';

function Create() {
    const [title, setTitle] = useState('');
    const [bodyText, setBodyText] = useState('');
    const [errors, setErrors] = useState({});

    function submit() {
        const newErrors = {};

        if (!titleRegex.test(title)) {
            newErrors.title = 'Invalid title!';
        }

        if (!bodyTextRegex.test(bodyText)) {
            newErrors.bodyText = 'Invalid body text!';
        }

        if (Object.keys(newErrors).length === 0) {
            const formData = new FormData();

            formData.append('title', title);
            formData.append('bodyText', bodyText);

            const promise = api.post('posts', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                error: 'Error occured!',
                success: 'Done!'
            });

            
        }

        setErrors(newErrors);
    }

    return (
        <div className="create-wrapper">
            <div className="create-container">
                <h2>Create post</h2>
                <input 
                    className={`primary-input ${errors.title ? 'error' : ''}`} 
                    type="text" 
                    placeholder='Title'
                    value={title}
                    onChange={(e)=>{setTitle(e.target.value);setErrors({});}}/>
                <div className="indicator-group">
                    <ErrorIndicator
                        errors={errors}
                        propName={'title'}/>
                    <LengthIndicator
                        text={title}
                        maxLength={100}/>
                </div>
                <TipTap/>
                {/* <textarea 
                    className={`${errors.bodyText ? 'error' : ''}`}
                    name="" 
                    id=""
                    placeholder='Body text'
                    value={bodyText}
                    onChange={(e)=>{setBodyText(e.target.value);setErrors({});}}></textarea> */}
                <div className="indicator-group">
                    <ErrorIndicator
                        errors={errors}
                        propName={'bodyText'}/>
                    <LengthIndicator
                        text={bodyText}
                        maxLength={1000}/>
                </div>
                <div className="buttons">
                    <button 
                        className="primary-button"
                        onClick={submit}>Post</button>
                    <button 
                        className="secondary-button">Clear</button>
                </div>
            </div>
        </div>
    )
}

export default Create;