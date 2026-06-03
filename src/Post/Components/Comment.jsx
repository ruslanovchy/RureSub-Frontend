import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import { toPostDateFormat } from "../../utils/dateFormat";
import './Comment.scss'
import TipTap from "../../Components/TipTap/TipTap";
import { icons } from "../../assets/icons/icons";
import { toIndicatorFormat } from "../../utils/indicatorFormat";
import { PostContext } from "../Post";
import CommentField from "./CommentField";
import { commentMaxLength } from "../../validation/postValidation";
import { api } from "../../api";
import { notifyError, notifyPromise, notifySuccess } from "../../notification";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../App";
import { useProfileStore } from "../../stores/profileStore";
import { useOverlayStore } from "../../Overlay/overlayStore";
import { useNavigate } from "react-router-dom";

async function fetchReplies({ pageParam }) {
    let url = `posts/comments?postId=${pageParam.postId}&rootCommentId=${pageParam.rootCommentId}`

    if (pageParam.lastCommentId) {
        url += `&lastCommentId=${pageParam.lastCommentId}`;
    }
    if (pageParam.lastCommentCreatedAt) {
        url += `&lastCommentCreatedAt=${pageParam.lastCommentCreatedAt}`;
    }

    const response = await api.get(url);

    return response.data;
}

const Comment = forwardRef((
    {
        data, 
        postId, 
        isReply = false, 
        rootCommentId, 
        onDelete,
        rootQueryKey
    }, ref) => {
    const [avatarSrc, setAvatarSrc] = useState(data.author.avatarUrl ?? assets.userDefaultAvatar);
    const postContext = useContext(PostContext);
    const profileData = useProfileStore(store => store.data);
    const setOverlayData = useOverlayStore(store => store.setData);
    const commentFieldRef = useRef(null);
    const repliesQueryKey = ['replies', data.id]
    const [showReplies, setShowReplies] = useState(false);
    const [isOwn, setIsOwn] = useState(profileData?.userId === data.authorId)
    const addActionsButtonRef = useRef(null);
    const addActionsRef = useRef(null);
    const [addActionsOpened, setAddActionsOpened] = useState(false);
    const navigate = useNavigate();

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

    const likeMutation = useMutation({
        mutationFn: async ({ commentId, isLiked }) => {
            const url = `comments/likes/like?commentId=${commentId}`;

            if (isLiked) {
                return await api.delete(url);
            }

            return await api.post(url);
        },
        onMutate: async ({ commentId }) => {
            await queryClient.cancelQueries({ rootQueryKey });

            const previousData = queryClient.getQueryData(rootQueryKey);

            queryClient.setQueryData(rootQueryKey,
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => 
                            page.map(comment => {
                                if (comment.id !== commentId) {
                                    return comment;
                                }

                                const newIsLiked = !comment.isLiked;

                                return {
                                    ...comment,
                                    isLiked: newIsLiked,
                                    likesCount: comment.isLiked 
                                        ? comment.likesCount - 1
                                        : comment.likesCount + 1
                                }
                            })
                        )
                    }
                }
            )

            return { previousData }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(
                rootQueryKey,
                context.previousData
            )
        }
    })

    function like() {
        likeMutation.mutate({
            commentId: data.id,
            isLiked: data.isLiked
        })
    }

    async function deleteComment() {
        
    }

    const {
        data: repliesData,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: repliesQueryKey,
        queryFn: fetchReplies,
        initialPageParam: { postId, rootCommentId: data.id },
        getNextPageParam: (lastPage, pages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0) return undefined;

            const lastReply = lastPage[lastPage.length - 1]

            return {
                postId,
                lastCommentId: lastReply.id,
                lastCommentCreatedAt: lastReply.createdAt,
                rootCommentId: data.id
            }
        },
        enabled: showReplies
    })

    function sendReply(editorData, setErrors) {
        const newErrors = {};

        if (editorData.length > commentMaxLength) {
            newErrors.content = 'Invalid comment!'
        }

        if (Object.keys(newErrors).length === 0) {
            
            const contentJson = editorData.json;
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

            formData.append('postId', data.postId);
            formData.append('content', JSON.stringify(contentJson));
            formData.append('rootCommentId', isReply ? rootCommentId : data.id);
            
            if (isReply) {
                formData.append('replyCommentAuthorId', data.authorId);
            }

            const promise = api.post('posts/comments', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                error: 'Error occured!'
            });

            promise.then(response => {
                if (response.status !== 200) return;
                commentFieldRef.current.clear();
                postContext.setReplyingCommentId('');

                if (response.data !== null) {
                    queryClient.setQueryData(['replies', isReply ? rootCommentId : data.id], (oldData) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page, index) => {
                                if (index === oldData.pages.length - 1) {
                                    return [...page, response.data];
                                }
                                return page;
                            })
                        }
                    });
                    queryClient.setQueryData(rootQueryKey, (oldData) => {
                        if (!oldData) return oldData;

                        return {
                            ...oldData,
                            pages: oldData.pages.map(page => 
                                page.map(comment => {
                                    if (isReply ? 
                                        rootCommentId :
                                        comment.id === data.id) {
                                        return {
                                            ...comment,
                                            repliesCount: comment.repliesCount + 1
                                        }
                                    }
                                    return comment;
                                })
                            )
                        }
                    });
                }
            });
        }

        setErrors(newErrors);
    }

    function deleteReply(replyId, callBack) {
        const url = `posts/comments?commentId=${replyId}`;

        const promise = api.delete(url);

        notifyPromise(promise, {
            loading: 'Loading',
            error: 'Error occured',
            success: 'Done!'
        })

        promise.then(response => {
            if (response.status !== 200) return;

            queryClient.setQueryData(repliesQueryKey, (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map(page => 
                        page.filter(c => c.id !== replyId)
                    )
                }
            });
            queryClient.setQueryData(rootQueryKey, (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map(page => 
                        page.map(comment => {
                            if (isReply ? 
                                rootCommentId :
                                comment.id === data.id) {
                                return {
                                    ...comment,
                                    repliesCount: comment.repliesCount - 1
                                }
                            }
                            return comment;
                        })
                    )
                }
            });

            if(callBack) callBack();
        });
    }

    function getAddActionsContent() {
        if (!isOwn) {
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
                        onClick={() => { setOverlayData({
                            title: 'Confirmation',
                            textContent: 'Are you sure want to delete comment?',
                            modal: {
                                className: 'delete-comment-modal',
                            },
                            buttons: [
                                {
                                    className: 'secondary-button',
                                    onClick: () => {
                                        setOverlayData(null);
                                    },
                                    textContent: 'Cancel'
                                },
                                {
                                    className: 'primary-button',
                                    onClick: () => {
                                        onDelete(data.id, () => {
                                            setOverlayData(null);
                                        });
                                    },
                                    textContent: 'Sure'
                                },
                            ]
                        }); }}/>
                </>
            )
        }
    }

    const replies = 
        repliesData?.pages?.flatMap(r => r) ?? [];

    return (
        <div
            className="comment-container">
                
            <div className="comment-header">
                <div 
                    className="left"
                    onClick={(e) => {
                        navigate(`/user/${data.author.userName}`)
                    }}>
                    <img src={avatarSrc}
                        onError={() => setAvatarSrc(assets.userDefaultAvatar)} alt="" />

                    <span className="display-name">{data.author.displayName}</span>
                    {
                        !!data.replyToSelection &&
                        <span className="reply-display-name">replies to {data.replyToSelection.userDisplayName}</span>
                    }
                    <div className="date">
                        <span>•</span>
                        <span>
                            {toPostDateFormat(new Date(data.createdAt))}
                        </span>
                    </div>
                </div>
                <div className="right">
                    {
                        isOwn ? 
                        <button 
                            className="transparent-button add-actions-button"
                            ref={addActionsButtonRef}
                            onClick={() => { setAddActionsOpened(!addActionsOpened); }}>
                            •••
                        </button> : <></>
                    }

                </div>
            </div>

            <div className="comment-body">
                <TipTap
                    content={data.content}
                    editable={false}/>
            </div>

            <div className="comment-footer">
                <div 
                    className="left">
                    <div className="like-group group"
                        onClick={like}>
                        <img src={
                            data.isLiked ?
                            icons.heartFilledIcon : icons.heartIcon} alt="" />
                        <span>{toIndicatorFormat(data.likesCount)}</span>
                    </div>
                    <div 
                        className="reply-group group"
                        onClick={() => {
                            postContext.setReplyingCommentId(postContext.replyingCommentId === data.id ? '' : data.id);
                        }}>
                        <img 
                            src={icons.reply} 
                            alt="" />
                        <span>Reply</span>
                    </div>
                    {
                        !isReply && data.repliesCount > 0 &&
                        <div 
                            className="reply-group group"
                            onClick={() => {
                                setShowReplies(!showReplies);
                            }}>
                            <span>
                                { showReplies ? `▲ Hide replies (${toIndicatorFormat(data.repliesCount)})` : `▼ Show replies (${toIndicatorFormat(data.repliesCount)})`}
                            </span>
                        </div>
                    }
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

            <div className="reply-container">
                {
                    postContext.replyingCommentId === data.id &&
                    <CommentField
                        send={sendReply}
                        placeholder={'Enter your reply'}
                        cancel={() => { postContext.setReplyingCommentId(''); }}
                        ref={commentFieldRef}/>
                }
            </div>

            {
                showReplies && !isReply &&
                <div
                    className="replies-container">
                        {
                            replies.map((r, i) => {
                                return (
                                    <Comment
                                        key={r.id}
                                        data={r}
                                        postId={postId}
                                        isReply={true}
                                        rootCommentId={data.id}
                                        onDelete={deleteReply}
                                        rootQueryKey={repliesQueryKey}/>
                                )
                            })
                        }
                        {
                            hasNextPage &&
                            <span
                                className="load-more"
                                onClick={() => fetchNextPage() }>▼ Load more</span>
                        }
                </div>
            }

        </div>
    )
});

function AddActionsButton({ icon, text, onClick }) {

    return (
        <button className="transparent-button add-action-button"
            onClick={onClick}>
            {icon ? <img src={icon} alt="" /> : <div></div>}
            <span>{text}</span>
        </button>
    )
}

export default Comment;