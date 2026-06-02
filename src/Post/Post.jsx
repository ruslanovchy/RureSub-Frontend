import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import './Post.scss'
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { toPostDateFormat } from '../utils/dateFormat';
import TipTap from '../Components/TipTap/TipTap';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { toIndicatorFormat } from '../utils/indicatorFormat';
import { icons } from '../assets/icons/icons';
import { queryClient } from '../App';
import CommentField from './Components/CommentField';
import Comment from './Components/Comment';
import { commentMaxLength } from '../validation/postValidation';
import { notifyPromise } from '../notification';

export const PostContext = createContext();

async function fetchPost(id) {
    const response = await api.get(`posts?id=${id}`)
    return response.data;
}

async function fetchComments({ pageParam }) {
    let url = `posts/comments?postId=${pageParam.postId}`

    if (pageParam.lastCommentId) {
        url += `&lastCommentId=${pageParam.lastCommentId}`;
    }
    if (pageParam.lastCommentCreatedAt) {
        url += `&lastCommentCreatedAt=${pageParam.lastCommentCreatedAt}`;
    }

    const response = await api.get(url);

    return response.data;
}

function Post() {
    const pathParam = useParams();
    const queryKey = ['post', pathParam.id]
    const commentsQueryKey = ['comments', pathParam.id]
    const feedQueryKey = ['feed']
    const [replyingCommentId, setReplyingCommentId] = useState('');

    //#region queries

    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchPost(pathParam.id),
    })

    const {
        data: commentsData,
        isLoading: commentsIsLoading,
        error: commentsError,
        hasNextPage: commentsHasNextPage,
        fetchNextPage: commentsFetchNextPage,
        isFetchingNextPage: commentsIsFetchingNextPage
    } = useInfiniteQuery({
        queryKey: commentsQueryKey,
        queryFn: fetchComments,
        initialPageParam: { postId: pathParam.id },
        getNextPageParam: (lastPage, pages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0) return undefined;

            const lastComment = lastPage[lastPage.length - 1]

            return {
                postId: pathParam.id,
                lastCommentId: lastComment.id,
                lastCommentCreatedAt: lastComment.createdAt
            }
        },
        enabled: !!pathParam,
    })

    const commentsObserverRef = useRef(null)

    const commentsLoadingRef = useCallback((node) => {
        if (commentsObserverRef.current) commentsObserverRef.current.disconnect();

        if (node) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && commentsHasNextPage && !commentsIsFetchingNextPage) {
                    commentsFetchNextPage();
                }
            });

            observer.observe(node);
            commentsObserverRef.current = observer;
        }
    }, [commentsHasNextPage, commentsIsFetchingNextPage, commentsFetchNextPage])

    //#endregion

    const likeMutation = useMutation({
        mutationFn: async ({ postId, isLiked }) => {
            const url = `posts/likes/like?postId=${postId}`;

            if (isLiked) {
                return await api.delete(url);
            }

            return await api.post(url);
        },
        onMutate: async ({ isLiked, postId }) => {
            await queryClient.cancelQueries(queryKey);

            const previousData = queryClient.getQueryData(queryKey);
            const previousFeedData = queryClient.getQueryData(feedQueryKey);

            queryClient.setQueryData(queryKey,
                (oldData) => {
                    const newIsLiked = !oldData.isLiked;

                    return {
                        ...oldData,
                        isLiked: newIsLiked,
                        likesCount: newIsLiked 
                            ? oldData.likesCount + 1 
                            : oldData.likesCount - 1
                    }
                }
            )

            queryClient.setQueryData(feedQueryKey,
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
                                    likesCount: newIsLiked 
                                        ? post.likesCount + 1
                                        : post.likesCount - 1
                                }
                            })
                        )
                    }
                }
            )

            return { previousData, previousFeedData }
        },
        onError: (err, variables, context) => {
            if (context) {
                queryClient.setQueryData(queryKey, context.previousData);
                queryClient.setQueryData(feedQueryKey, context.previousFeedData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(queryKey);
            queryClient.invalidateQueries(feedQueryKey);
        }
    })

    function like() {
        if (data) {
            likeMutation.mutate({
                isLiked: data.isLiked,
                postId: data.id
            })
        }
    }

    const commentFieldRef = useRef(null);

    if (isLoading || error) return null;

    //#region comments

    const comments = commentsData?.pages?.flatMap(c => c) ?? [];
    
    function sendComment(editorData, setErrors) {
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

            formData.append('postId', pathParam.id);
            formData.append('content', JSON.stringify(contentJson));

            const promise = api.post('posts/comments', formData);

            notifyPromise(promise, {
                loading: 'Loading...',
                error: 'Error occured!'
            });

            promise.then(response => {
                if (response.status !== 200) return;
                commentFieldRef.current.clear();

                if (response.data !== null) {
                    queryClient.setQueryData(commentsQueryKey, (oldData) => {
                        if (!oldData) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page, index) => {
                                if (index === 0) {
                                    return [response.data, ...page];
                                }
                                return page;
                            })
                        }
                    });
                }
            });
        }

        setErrors(newErrors);
    }

    function deleteComment(commentId, callBack) {
        const url = `posts/comments?commentId=${commentId}`;

        const promise = api.delete(url);

        notifyPromise(promise, {
            loading: 'Loading',
            error: 'Error occured',
            success: 'Done!'
        })

        promise.then(response => {
            if (response.status !== 200) return;

            queryClient.setQueryData(commentsQueryKey, (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map(page => 
                        page.filter(c => c.id !== commentId)
                    )
                }
            });

            if(callBack) callBack();
        })
    }

    function cancelComment() {
        commentFieldRef.current.clear();
    }

    //#endregion

    //#region context

    const contextData = {
        replyingCommentId,
        setReplyingCommentId
    }

    //#endregion

    return (
        <PostContext.Provider value={contextData}>
        <div className="post-page-wrapper">
            <div className="post-page-container">

                <div className="post-page-header">
                    <div className="left">
                        <img src={data.author.avatarUrl} alt="" />
                        <div className="names">
                            <span className='display-name'>{data.author.displayName}</span>
                            <span className='user-name'>{data.author.userName}</span>
                        </div>
                        <div className="date">
                            <span>•</span>
                            <span>
                                {toPostDateFormat(new Date(data.postedAt))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="post-page-content">
                    <h2>{data.title}</h2>
                    <TipTap
                        editable={false}
                        content={data.content}/>
                </div>

                <div className="post-page-footer">
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
                            className="comments-group group">
                            <img src={icons.commentsIcon} alt="" />
                            <span>{toIndicatorFormat(data.commentsCount)}</span>
                        </div>
                    </div>
                    <div 
                        className="right"> 
                    </div>
                </div>

                <h2>Comments</h2>

                <div className="comment-textarea-container">
                    <CommentField
                        send={sendComment}
                        cancel={cancelComment}
                        ref={commentFieldRef}/>
                </div>

                <div className="comments">
                    {
                        comments?.map((c, i) => {
                            return (
                                <div
                                    key={c.id}
                                    ref={i < 3 ? i == 0 ? commentsLoadingRef : null : i === comments.length - 3 ? commentsLoadingRef : null}>
                                    <Comment
                                        data={c}
                                        postId={pathParam.id}
                                        onDelete={deleteComment}
                                        rootQueryKey={commentsQueryKey}/>
                                </div>
                            )
                        })
                    }
                    <div
                        className={`loading-circle-container ${commentsHasNextPage ? '' : 'hidden'}`}>
                        <div className='circle'></div>
                    </div>
                </div>

            </div>
        </div>
        </PostContext.Provider>
    )
}

export default Post;