import { useCallback, useContext, useRef } from 'react';
import './Followers.scss'
import { ProfileContext } from '../../../User';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../../../api';
import UserCard from '../UserCard';
import { useProfileStore } from '../../../../stores/profileStore';
import LoadingCircle from '../../../../Components/LoadingCircle';

async function fetchFollowers({ pageParam }) {
    let url = `profile/followers?profileId=${pageParam.profileId}&page=${pageParam.page}`
    
    const response = await api.get(url);
    return response.data;
}

function Followers() {
    const ownProfileData = useProfileStore(store => store.data);
    const context = useContext(ProfileContext);
    const queryKey = ['followers', context.profileData.id];

    const {
        data,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: queryKey,
        queryFn: fetchFollowers,
        initialPageParam: {
            profileId: context.profileData.id,
            page: 1
        },
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }
            return {
                profileId: context.profileData.id,
                page: lastPageParam.page + 1
            }
        }
    });

    const observerRef = useRef();

    const loadingRef = useCallback((node) => {
        if (observerRef.current) observerRef.current.disconnect();

        if (node) {

            const newObserver = new IntersectionObserver((entries) => {
                if (entries.length > 0 && hasNextPage && entries[0].isIntersecting && !isFetchingNextPage) {
                    fetchNextPage();
                }
            });

            newObserver.observe(node);
            observerRef.current = newObserver;
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    if (isLoading) return;

    if (error) return;

    const followers = 
        data.pages.flatMap(p => p) ?? [];

    return (
        <div
            className='followers-container'>
            {
                followers.map((f, i) => {
                    return (
                        <div
                            key={['followings', f.id, i]}
                            ref={followers.length > 3 ? i == followers.length - 2 ? loadingRef : null : i == 0 ? loadingRef : null}>
                            <UserCard
                                data={f}
                                isOwn={context?.profileData?.id == ownProfileData?.id}
                                queryKey={queryKey}/>
                        </div>
                    )
                })
            }
            <LoadingCircle
                hasNextPage={hasNextPage}/>
        </div>
    )
}

export default Followers;