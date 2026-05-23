import { useRef, useState } from 'react';
import './Create.scss'
import { bodyTextMaxLength, titleRegex } from '../validation/postValidation';
import LengthIndicator from '../Components/LengthIndicator';
import ErrorIndicator from '../Components/ErrorIndicator';
import { api } from '../api';
import { notifyPromise } from '../notification';
import TipTap from '../Components/TipTap/TipTap.jsx';
import { globalNavigate } from '../App.jsx';
import { useNavigate } from 'react-router-dom';

function Create() {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [errors, setErrors] = useState({});

    const editorRef = useRef(null);
    const [editorData, setEditorData] = useState({ json: null, length: 0 });

    function submit() {
        const newErrors = {};

        if (!titleRegex.test(title)) {
            newErrors.title = 'Invalid title!';
        }

        const contentJson = editorRef.current?.getJSON();

        if (!contentJson || contentJson.content?.length === 0 || editorData.length > bodyTextMaxLength) {
            newErrors.content = 'Invalid body text!';
        }

        if (Object.keys(newErrors).length === 0) {
            const formData = new FormData();

            const promise = api.post('posts/', {
                title,
                content: contentJson
            });

            notifyPromise(promise, {
                loading: 'Loading...',
                error: 'Error occured!',
                success: 'Done!'
            });

            promise.then(response => {
                if (response !== 200) return;
                navigate('/');
            })
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
                <TipTap 
                    ref={editorRef}
                    onChange={setEditorData}
                    maxLength={4000}/>
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
                        propName={'content'}/>
                    <LengthIndicator
                        length={editorData.length}
                        maxLength={bodyTextMaxLength}/>
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