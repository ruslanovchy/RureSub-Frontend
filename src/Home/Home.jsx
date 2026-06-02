import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../api';
import './Home.scss'
import PostCard from '../Components/PostCard';
import { useCallback, useEffect, useRef } from 'react';
import { queryClient } from '../App';

async function getFeed({ pageParam = null }) {
    let url = 'posts/feed';

    if (pageParam) {
        url += `?lastPostedAt=${pageParam.lastPostedAt}`;
        url += `&lastId=${pageParam.lastId}`;
    }

    const response = await api.get(url);

    return response.data;
}

function Home() {

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: getFeed,
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }

            const lastPost = lastPage[lastPage.length - 1];

            return {
                lastPostedAt: lastPost.postedAt,
                lastId: lastPost.id
            }
        }
    })

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

    const posts =
        data?.pages.flatMap(page => page) ?? [];

    return (
        <div className="home-wrapper">
            <div className="home-container">
                {
                    posts.map((p, i) => {
                        return (
                            <div
                                key={p.id}
                                ref={i < 3 ? i == 0 ? loadingRef : null : i === posts.length - 3 ? loadingRef : null}>
                                <PostCard
                                    data={p}
                                    queryKey={['feed']}/>
                            </div>
                        )
                    })
                }
                <div
                    className={`loading-circle-container ${hasNextPage ? '' : 'hidden'}`}>
                    <div className='circle'></div>
                </div>
            </div>
        </div>
    )
}

export default Home;