import { useEffect, useRef, useState } from 'react';
import './Create.scss'
import { bodyTextMaxLength, titleRegex } from '../validation/postValidation';
import LengthIndicator from '../Components/LengthIndicator';
import ErrorIndicator from '../Components/ErrorIndicator';
import { api } from '../api';
import { notifyPromise, notifySuccess } from '../notification';
import TipTap from '../Components/TipTap/TipTap.jsx';
import { globalNavigate } from '../App.jsx';
import { useNavigate } from 'react-router-dom';
import MediaViewer from '../Components/MediaViewer/MediaViewer.jsx';
import { icons } from '../assets/icons/icons.js';
import { copyToClipboard } from '../utils/clipboard.js';

function Create() {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [errors, setErrors] = useState({});

    const [mediaItems, setMediaItems] = useState([]);

    const editorRef = useRef(null);
    const [editorData, setEditorData] = useState({ json: null, length: 0 });

    const inputRef = useRef(null);
    const [postedLink, setPostedLink] = useState('');
    const [postedId, setPostedId] = useState('');
    const [openedPage, setOpenedPage] = useState('create');

    function submit() {
        const newErrors = {};

        if (!titleRegex.test(title)) {
            newErrors.title = 'Invalid title!';
        }

        const contentJson = editorData.json;
        const content = contentJson?.content;

        if (editorData.length > bodyTextMaxLength) {
            newErrors.content = 'Invalid body text!';
        }

        if (!title || !titleRegex.test(title)) {
            newErrors.title = 'Invalid title!';
        }

        if (Object.keys(newErrors).length === 0) {
            const formData = new FormData();

            if (content) {
                let start = content.length;

                for (let i = content.length - 1; i >= 0; i--) {
                    if (!content[i].content) {
                        start = i;
                    }
                    else {
                        break;
                    }
                }

                contentJson.content = content.filter((_, index) => index < start);
            }
            
            formData.append("title", title);
            formData.append("content", contentJson == null ? null : JSON.stringify(contentJson));
            mediaItems.flatMap(i => { 
                formData.append("mediaFiles", i.file);
            });
            

            const promise = api.post('posts/', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                error: 'Error occured!',
                success: 'Done!'
            });

            promise.then(response => {
                if (response.status !== 200) return;
                setOpenedPage('posted');
                setPostedId(response.data);
                setPostedLink(`${window.location.origin}/posts/${response.data}`);
            })
        }

        setErrors(newErrors);
    }

    function clear() {
        setTitle('');
        editorRef.current.clearContent();
    }

    function handleFileSelection(e) {
        const selectedFiles = e.target.files;
        const newMediaItems = [...mediaItems];

        Array.from(selectedFiles).forEach(file => {
            newMediaItems.push({
                id: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                src: URL.createObjectURL(file),
                file
            })
        });

        setMediaItems(newMediaItems);
        e.target.value = ''
    }

    function handleFileRemove(item, index) {
        const newMediaItems = [...mediaItems];
        setMediaItems(newMediaItems.filter(i => i !== item));
    }

    return (
        <div className="create-wrapper">
            {
                openedPage == 'create' 
                ?
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
                            maxLength={400}/>
                    </div>

                    <h3>Images & Videos</h3>

                    <input type="file"
                        style={{
                            'display': 'none'
                        }} 
                        accept='image/*, video/*'
                        onChange={handleFileSelection}
                        ref={inputRef}
                        multiple/>

                    {
                        mediaItems.length === 0 
                        ?
                        <div 
                            className="select-file-container"
                            onClick={() => inputRef.current.click() }>
                            <p>Select file</p>
                        </div>
                        :
                        <MediaViewer
                            mediaItems={mediaItems}
                            buttons={[
                                {
                                    className: 'primary-button small',
                                    textContent: 'Add',
                                    onClick: (item, index) => {
                                        inputRef.current.click();
                                    }
                                },
                                {
                                    className: 'secondary-button small',
                                    textContent: 'Remove',
                                    onClick: handleFileRemove
                                }
                            ]}/>
                    }

                    <br/>

                    <TipTap 
                        ref={editorRef}
                        onChange={setEditorData}
                        maxLength={4000}/>

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
                            className="secondary-button"
                            onClick={clear}>Clear</button>
                    </div>
                    <br />
                </div>
                :
                <div
                    className='posted-container'>
                    <h1>Successfully posted!</h1>

                    <div className="link-container">
                        <h3>Share</h3>
                        <div
                            className='link-row'>
                            <input type="text"
                                value={postedLink} 
                                onChange={() => {}}/>
                            <button
                                className='secondary-button'
                                onClick={() => {
                                    navigate(`/post/${postedId}`)
                                }}>
                                Go
                            </button>
                            <button
                                className='secondary-button'
                                onClick={() => {
                                    copyToClipboard(postedLink);
                                    notifySuccess('Copied!');
                                }}>
                                Copy
                            </button>
                        </div>
                    </div>

                    <button
                        className='transparent-button home-button'
                        onClick={() => {
                            navigate('/');
                        }}>
                        <img src={icons.home} alt="" />
                    </button>
                </div>
            }
            
        </div>
    )
}

export default Create;