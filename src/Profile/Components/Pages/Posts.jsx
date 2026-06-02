import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import './Posts.scss'
import { api } from '../../../api';
import PostCard from '../../../Components/PostCard';
import { useProfileStore } from '../../../stores/profileStore';
import { useParams } from 'react-router-dom';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ProfileContext } from '../../Profile';
import { notifyPromise, notifySuccess } from '../../../notification';
import { icons } from '../../../assets/icons/icons';
import { resetQuery } from '../../../App';
import { useOverlayStore } from '../../../Overlay/overlayStore';

async function fetchPosts({ pageParam }) {
    let url = `posts/user?id=${pageParam.userId}`;

    if (pageParam) {
        url += `&lastPostedAt=${pageParam.lastPostedAt}&lastId=${pageParam.lastId}`
    }

    const response = await api.get(url);
    
    return response.data;
}

function Posts() {
    const profileContext = useContext(ProfileContext);
    const queryClient = useQueryClient();
    const setOverlayData = useOverlayStore(store => store.setData);

    const queryKey = ['profilePosts', profileContext?.profileData.userId];

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey,
        queryFn: fetchPosts,
        initialPageParam: { userId: profileContext?.profileData?.userId },
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }

            const lastPost = lastPage[lastPage.length - 1];

            return {
                userId: lastPageParam.userId,
                lastPostedAt: lastPost.postedAt,
                lastId: lastPost.id
            }
        },
        enabled: !!profileContext.profileData
    });

    const [isOverlayOpened, setIsOverlayOpened] = useState(false);
    const [openedModal, setOpenedModal] = useState('');
    const overlayRef = useRef(null);

    const posts = 
        data?.pages.flatMap(page => page) ?? [];

    function submitDelete(postToDelete) {
        if (!postToDelete) {
            return;
        }

        const promise = api.delete(`posts?postId=${postToDelete.id}`);

        notifyPromise(promise, {
            loading: 'Loading...',
            success: 'Done!',
            error: 'Error occured!'
        });

        promise.then(response => {
            if (response.status !== 200) return;
            setIsOverlayOpened(false);
            setOpenedModal('');
            
            queryClient.setQueryData(
                queryKey,
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page =>
                            page.filter(post => post.id !== postToDelete.id)
                        )
                    }
                }
            )
        });
    }

    const observerRef = useRef(null);
    
    const loadingRef = useCallback((node) => {
        if (observerRef.current) observerRef.current.disconnect();

        if (node) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            });

            observer.observe(node);
            observerRef.current = observer;
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    if (error) return;
    if (isLoading) return;

    return (
        <div className="posts-container">
            {
                posts.map((p, i) => {
                    return (
                        <div
                            key={p.id}
                            ref={i < 3 ? i == 0 ? loadingRef : null :i === posts.length - 3 ? loadingRef : null}>
                            <PostCard
                                data={p}
                                showFollowButton={false}
                                mode={profileContext.isProfileOwner ? 'own' : 'feed'}
                                queryKey={queryKey}
                                onDelete={() => {
                                    setOverlayData({
                                        title: 'Confirmation',
                                        textContent: 'Are you sure want to delete post?',
                                        modal: {
                                            className: 'delete-card'
                                        },
                                        buttons: [
                                            {
                                                className: 'secondary-button',
                                                textContent: 'Cancel',
                                                onClick: () => {
                                                    setOverlayData(null);
                                                }
                                            },
                                            {
                                                className: 'primary-button',
                                                textContent: 'Sure',
                                                onClick: () => { submitDelete(p); setOverlayData(null); }
                                            },
                                        ]
                                    })
                                }}/>
                        </div>
                    )
                })
            }
            <div
                className={`loading-circle-container ${hasNextPage ? '' : 'hidden'}`}>
                <div className='circle'></div>
            </div>            
        </div>
    )
}

export default Posts;