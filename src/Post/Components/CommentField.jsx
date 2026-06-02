import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import TipTap from "../../Components/TipTap/TipTap";
import './CommentField.scss';
import LengthIndicator from "../../Components/LengthIndicator";
import ErrorIndicator from "../../Components/ErrorIndicator";
import { commentMaxLength } from "../../validation/postValidation";
import { api } from "../../api";
import { notifyPromise } from "../../notification";

const CommentField = forwardRef(({ send, cancel, placeholder = 'Enter your comment' }, ref) => {

    const [commentEditorData, setCommentEditorData] = useState({ json: null, length: 0 });
    const [isCommentButtonsOpened, setIsCommentButtonsOpened] = useState();
    const editorRef = useRef(null);
    const [errors, setErrors] = useState({});

    useImperativeHandle(ref, () => ({
        clear: () => editorRef.current.clearContent(),
        commentEditorData
    }));

    return (
        <div className="comment-field">
            <TipTap
                placeholder={placeholder}
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
                    onClick={() => send(commentEditorData, setErrors)}>
                    Send
                </button>
                <button 
                    className="secondary-button"
                    onClick={cancel}>
                    Cancel
                </button>
            </div>
        </div>
    )
});

export default CommentField;