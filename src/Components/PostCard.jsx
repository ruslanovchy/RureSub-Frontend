import { useNavigate } from "react-router-dom";
import TipTap from "./TipTap/TipTap";
import { useEffect, useRef, useState } from "react";
import './PostCard.scss'
import { icons } from "../assets/icons/icons";
import { api } from "../api";
import { toPostDateFormat } from "../utils/dateFormat";
import { toIndicatorFormat } from "../utils/indicatorFormat";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../App";
import { assets } from "../assets/assets";


function PostCard({ 
    data, 
    showFollowButton = true, 
    mode = 'feed',
    queryKey = 'feed',
    onDelete,
    onLike }) {

    const navigate = useNavigate();
    const tipTapRef = useRef();
    const [avatarSrc, setAvatarSrc] = useState(data.author.avatarUrl);
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

    const likeMutation = useMutation({
        mutationFn: async ({ postId, isLiked }) => {
            const url = `posts/likes/like?postId=${postId}`;

            if (isLiked) {
                return await api.delete(url);
            }

            return await api.post(url);
        },
        onMutate: async ({ postId }) => {
            await queryClient.cancelQueries({ queryKey: queryKey });

            const previousFeed = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey,
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => 
                            page.map(post => {
                                if (post.id !== postId) {
                                    return post;
                                }

                                const newIsLiked = !post.isLiked;

                                return {
                                    ...post,
                                    isLiked: newIsLiked,
                                    likesCount: post.isLiked 
                                        ? post.likesCount - 1
                                        : post.likesCount + 1
                                }
                            })
                        )
                    }
                }
            )

            return { previousFeed }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(
                queryKey,
                context.previousFeed
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries(queryKey);
        }
    })

    function like() {
        likeMutation.mutate({
            postId: data.id,
            isLiked: data.isLiked
        })
    }

    const containerRef = useRef(null);
    const footerLeftRef = useRef(null);
    const headerLeftRef = useRef(null);
    const followButtonRef = useRef(null);
    const contentRef = useRef(null);

    const refs = [
        footerLeftRef,
        headerLeftRef,
        addActionsButtonRef,
        addActionsRef,
        followButtonRef,
        contentRef
    ]

    return (
        <div 
            className="post-container"
            ref={containerRef}
            onClick={(e) => {
                let doNavigate = true;

                for (let i = 0; i < refs.length; i ++) {
                    const r = refs[i];
                    if (r.current && (e.target == r.current || r.current.contains(e.target))){
                        doNavigate = false;
                        break;
                    }
                }
                
                if (doNavigate) {
                    navigate(`/post/${data.id}`);
                }
            }}>

            <div 
                className="post-header">
                <div 
                    className="left"
                    onClick={(e) => {
                        navigate(`/user/${data.author.userName}`)
                    }}
                    ref={headerLeftRef}>
                    <img src={avatarSrc}
                        onError={() => setAvatarSrc(assets.userDefaultAvatar)} alt="" />

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
                        <button 
                            className="secondary-button"
                            ref={followButtonRef}>
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

            <div className="content">
                <h2>{data.title}</h2>
                <div
                    ref={contentRef}>
                    <TipTap
                        editable={false}
                        ref={tipTapRef}
                        content={data.content}/>
                </div>
            </div>

            <div 
                className="footer">
                <div 
                    className="left"
                    ref={footerLeftRef}>
                    <div className="like-group group"
                        onClick={like}>
                        <img src={
                            data.isLiked ?
                            icons.heartFilledIcon : icons.heartIcon} alt="" />
                        <span>{toIndicatorFormat(data.likesCount)}</span>
                    </div>
                    <div 
                        className="comments-group group">
                        <img src={icons.commentsIcon} alt="" />
                        <span>{toIndicatorFormat(data.commentsCount)}</span>
                    </div>
                </div>
                <div 
                    className="right"> 
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