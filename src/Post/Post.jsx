import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import './Post.scss'
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { toPostDateFormat } from '../utils/dateFormat';
import TipTap from '../Components/TipTap/TipTap';
import { useEffect, useState } from 'react';
import { toIndicatorFormat } from '../utils/indicatorFormat';
import { icons } from '../assets/icons/icons';
import { queryClient } from '../App';
import CommentField from './Components/CommentField';

async function fetchPost(id) {
    const response = await api.get(`posts?id=${id}`)
    return response.data;
}

async function fetchComments(pageParam) {
    const url = `posts/comments?postId=${pageParam.postId}`

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
    const pathParams = useParams();
    const queryKey = ['post', pathParams.id]
    const commentsQueryKey = ['comments', pathParams.id]
    const feedQueryKey = ['feed']

    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchPost(pathParams.id),
    })

    const {
        data: commentsData,
        isLoading: commentsIsLoading,
        error: commentsError,
        commentsHasNextPage: hasNextPage,
        commentsFetchNextPage: fetchNextPage,
        commentsIsFetchingNextPage: isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: commentsQueryKey,
        queryFn: fetchComments,

    })

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

    if (isLoading || error) return null;

    function like() {
        if (data) {
            likeMutation.mutate({
                isLiked: data.isLiked,
                postId: data.id
            })
        }
    }

    return (
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
                        postId={data.id}/>
                </div>

                <div className="comments">
                    
                </div>

            </div>
        </div>
    )
}

export default Post;