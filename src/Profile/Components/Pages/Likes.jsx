import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import './Likes.scss'
import { api } from '../../../api';
import PostCard from '../../../Components/PostCard';
import { useProfileStore } from '../../../stores/profileStore';
import { useParams } from 'react-router-dom';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ProfileContext } from '../../Profile';
import { notifyPromise, notifySuccess } from '../../../notification';
import { icons } from '../../../assets/icons/icons';
import { resetQuery } from '../../../App';
import { useAuthOverlayStore, useAuthStore } from '../../../stores/authStore';

async function fetchPosts({ pageParam }) {
    let url = `posts/user_likes?id=${pageParam.userId}`;

    if (pageParam) {
        url += `&page=${pageParam.page}`
    }

    const response = await api.get(url);
    
    return response.data;
}

function Likes() {
    const profileContext = useContext(ProfileContext);
    const user = useAuthStore(store => store.user);
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
        queryKey: ['likes', profileContext?.profileData.userId],
        queryFn: fetchPosts,
        initialPageParam: { userId: profileContext?.profileData?.userId, page: 1 },
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }

            const lastPost = lastPage[lastPage.length - 1];

            return {
                userId: lastPageParam.userId,
                page: lastPageParam.page + 1,
            }
        },
        enabled: !!profileContext.profileData && !!user
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
                ['likes', profileContext?.profileData.userId],
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
                            ref={i === posts.length - 3 ? loadingRef : null}>
                            <PostCard
                                key={p.id}
                                data={p}
                                showFollowButton={false}
                                mode={!!user && user.id == p.authorId ? 'own' : 'feed'}
                                onDelete={() => {
                                    setPostToDelete(p);
                                    setIsOverlayOpened(true);
                                    setOpenedModal('delete');
                                }}/>
                        </div>
                    )
                })
            }
            <div
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

export default Likes;