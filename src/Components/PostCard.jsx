import { useNavigate } from "react-router-dom";
import TipTap from "./TipTap/TipTap";
import { useEffect, useRef, useState } from "react";
import './PostCard.scss'
import { icons } from "../assets/icons/icons";
import { api } from "../api";
import { toPostDateFormat } from "../utils/dateFormat";
import { toIndicatorFormat } from "../utils/indicatorFormat";


function PostCard({ 
    data, 
    showFollowButton = true, 
    mode = 'feed',
    onDelete,
    onLike }) {

    const navigate = useNavigate();
    const tipTapRef = useRef();
    const [addActionsOpened, setAddActionsOpened] = useState(false);
    const addActionsRef = useRef(null);
    const addActionsButtonRef = useRef(null);
    const [isLiked, setIsLiked] = useState(data.isLiked);
    const [likesCount, setLikesCount] = useState(data.likesCount);

    useEffect(() => {
        const handleClick = (e) => {
            if (e.target === addActionsRef.current || 
                addActionsRef.current.contains(e.target) ||
                e.target === addActionsButtonRef.current) {
                return;
            }
            setAddActionsOpened(false);
        }

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        }
    }, [])

    function getAddActionsContent() {
        if (mode == 'feed1') {
            return (
                <></>
            )
        }
        else {
            return (
                <>
                    <AddActionsButton
                        text={`Delete`}
                        icon={icons.trashIcon}
                        onClick={() => { if (onDelete) onDelete(); }}/>
                </>
            )
        }
    }

    function like() {
        const lastIsLiked = isLiked;
        const lastLikesCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount(lastIsLiked ? likesCount - 1 : likesCount + 1)
        const url = `posts/likes/like?postId=${data.id}`;
        const promise = lastIsLiked ? 
            api.delete(url) :
            api.post(url);

        promise.then(response => {
            if (response !== 200) return;
            onLike({ isLiked, postId: data.id });
        }).catch(error => {
            setIsLiked(lastIsLiked);
            setLikesCount(lastLikesCount);
        });
    }

    return (
        <div className="post-container">

            <div className="post-header">
                <div 
                    className="left"
                    onClick={(e) => {
                        navigate(`/user/${data.author.userName}`)
                    }}>
                    <img src={data.author.avatarUrl} alt="" />

                    <div className="names">
                        <span className="display-name">{data.author.displayName}</span>
                        <span className="user-name">@{data.author.userName}</span>
                    </div>
                    <div className="date">
                        <span>•</span>
                        <span>
                            {toPostDateFormat(new Date(data.postedAt))}
                        </span>
                    </div>
                </div>
                <div className="right">
                    {
                        showFollowButton &&
                        <button className="secondary-button">
                            Follow
                        </button> 
                    }
                    {
                        mode == 'own' ? 
                        <button 
                            className="transparent-button add-actions-button"
                            ref={addActionsButtonRef}
                            onClick={() => { setAddActionsOpened(!addActionsOpened); }}>
                            •••
                        </button> : <></>
                    }

                </div>
                <div className="right">

                </div>
            </div>

            <div className="body">
                <h2>{data.title}</h2>
                <TipTap
                    editable={false}
                    ref={tipTapRef}
                    content={data.content}/>
            </div>

            <div className="footer">
                <div className="left">
                    <div className="like-group group"
                        onClick={like}>
                        <img src={
                            isLiked ?
                            icons.heartFilledIcon : icons.heartIcon} alt="" />
                        <span>{toIndicatorFormat(likesCount)}</span>
                    </div>
                    <div className="like-group group">
                        <img src={icons.commentsIcon} alt="" />
                        <span>{toIndicatorFormat(data.commentsCount)}</span>
                    </div>
                </div>
                <div className="right"> 
                </div>
            </div>

            <div
                ref={addActionsRef} 
                className={`add-actions-container ${addActionsOpened ? 'opened' : ''}`}>
                {getAddActionsContent()}
            </div>
        </div>
    )
}

function AddActionsButton({ icon, text, onClick }) {

    return (
        <button className="transparent-button add-action-button"
            onClick={onClick}>
            {icon ? <img src={icon} alt="" /> : <div></div>}
            <span>{text}</span>
        </button>
    )
}

export default PostCard;