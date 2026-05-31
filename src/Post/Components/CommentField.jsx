import { useRef, useState } from "react";
import TipTap from "../../Components/TipTap/TipTap";
import './CommentField.scss';
import LengthIndicator from "../../Components/LengthIndicator";
import ErrorIndicator from "../../Components/ErrorIndicator";
import { commentMaxLength } from "../../validation/postValidation";
import { api } from "../../api";
import { notifyPromise } from "../../notification";

function CommentField({ postId }) {

    const [commentEditorData, setCommentEditorData] = useState({ json: null, length: 0 });
    const [isCommentButtonsOpened, setIsCommentButtonsOpened] = useState();
    const editorRef = useRef(null);
    const [errors, setErrors] = useState({});

    function submit() {
        const newErrors = {};

        if (commentEditorData.length > commentMaxLength) {
            newErrors.content = 'Invalid comment!'
        }

        if (Object.keys(newErrors).length === 0) {
            
            const contentJson = commentEditorData.json;
            const content = contentJson.content;

            let start = content.length;

            for (let i = content.length - 1; i >= 0; i--) {
                if (!content[i].content) {
                    start = i;
                }
                else {
                    break;
                }
            }

            contentJson.content = content.filter((_,index) => index < start);

            const formData = new FormData();

            formData.append('postId', postId);
            formData.append('content', JSON.stringify(contentJson));

            const promise = api.post('posts/comments', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                error: 'Error occured!'
            });

            promise.then(response => {
                if (response.status !== 200) return;
                clear();
            });
        }

        setErrors(newErrors);
    }

    function clear() {
        editorRef.current.clearContent();
    }

    return (
        <div className="comment-field">
            <TipTap
                placeholder='Enter your comment'
                ref={editorRef}
                onChange={(data) => {
                    setErrors({});
                    setCommentEditorData(data);
                }}/>
            <div className="indicator-group">
                <ErrorIndicator
                    errors={errors}
                    propName={'content'}/>
                <LengthIndicator
                    length={commentEditorData.length}
                    maxLength={commentMaxLength}/>
            </div>
            <div className={`buttons`}>
                <button 
                    className="primary-button"
                    disabled={commentEditorData.length === 0}
                    onClick={submit}>
                    Send
                </button>
                <button 
                    className="secondary-button"
                    disabled={commentEditorData.length === 0}
                    onClick={clear}>
                    Clear
                </button>
            </div>
        </div>
    )
}

export default CommentField;