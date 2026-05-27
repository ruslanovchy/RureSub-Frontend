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

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: ['myPosts', profileContext?.profileData.userId],
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
    const [postToDelete, setPostToDelete] = useState(null);
    const overlayRef = useRef(null);

    const posts = 
        data?.pages.flatMap(page => page) ?? [];

    function submitDelete() {
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
                ['myPosts', profileContext?.profileData.userId],
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
                        <PostCard
                            key={p.id}
                            data={p}
                            showFollowButton={false}
                            mode={profileContext.isProfileOwner ? 'own' : 'feed'}
                            onDelete={() => {
                                setPostToDelete(p);
                                setIsOverlayOpened(true);
                                setOpenedModal('delete');
                            }}/>
                    )
                })
            }
            <div
                ref={loadingRef}
                className={`loading-circle-container ${hasNextPage ? '' : 'hidden'}`}>
                <div className='circle'></div>
            </div>

            <div 
                className={`overlay ${isOverlayOpened ? 'opened' : ''}`}
                onClick={(e) => {
                    if (e.target === overlayRef.current) {
                        setIsOverlayOpened(false);
                    }
                }}
                ref={overlayRef}>
                {
                    openedModal == 'delete' ?
                    <div className="modal-card delete-card">
                        <button className="close-button"
                            onClick={()=>{
                                setIsOverlayOpened(false);
                            }}>
                            <img src={icons.crossIcon} alt="" />
                        </button>
                        <h3>Confirmation</h3>
                        <p>Are you sure want to delete post?</p>
                        <div className="buttons">
                            <button 
                                className="secondary-button"
                                onClick={()=>{
                                    setIsOverlayOpened(false);
                                }}>
                                Cancel
                            </button>
                            <button 
                                className="primary-button"
                                onClick={submitDelete}>
                                Delete
                            </button>
                        </div>
                    </div> :
                    <></>
                }
            </div>
            
        </div>
    )
}

export default Posts;