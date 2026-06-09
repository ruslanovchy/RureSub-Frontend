import { useRef, useState } from 'react';
import './UserCard.scss'
import { assets } from '../../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../../stores/profileStore';
import { useMutation } from '@tanstack/react-query';
import { useCheckAuthorize } from '../../../hooks/useAuthorizeCheck';
import { queryClient } from '../../../App';
import { api } from '../../../api';

function UserCard({ data, isOwn, queryKey }) {
    const [avatarSrc, setAvatarSrc] = useState(data.avatarUrl ?? assets.userDefaultAvatar);
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const checkAuthorize = useCheckAuthorize();

    const followMutation = useMutation({
        mutationFn: async ({ id, isFollowed }) => {
            const url = `followers?followingId=${id}`;

            if (isFollowed) {
                return await api.delete(url);
            }

            return await api.post(url);
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: queryKey });

            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey,
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => 
                            page.map(profile => {
                                if (profile.userId !== id) {
                                    return profile;
                                }

                                const newIsFollowed = !profile.isFollowed;

                                return {
                                    ...profile,
                                    isFollowed: newIsFollowed
                                }
                            })
                        )
                    }
                }
            )

            return { previousData }
        },
        onError: (err, variables, context) => {
            console.log(err)
            if (context) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(queryKey);
        }
    });

    function follow() {
        if (!checkAuthorize()) return;
        
        if (data) {
            followMutation.mutate({
                id: data.userId,
                isFollowed: data.isFollowed
            });
        }
    }

    return (
        <div className="user-card-container"
            onClick={(e) => {
                if (e.target !== buttonRef.current)
                    navigate(`/user/${data.userName}`);
            }}>
            <div className="left">
                <img 
                    src={avatarSrc}
                    onError={() => {
                        setAvatarSrc(assets.userDefaultAvatar)
                    }} 
                    alt="" />
                <div className="names">
                    <p
                        className='display-name'>
                        {data.displayName}
                    </p>
                    <p
                        className='user-name'>
                        @{data.userName}
                    </p>
                </div>
            </div>
            <div className="right">
                {
                    data.isFollowed
                    ?
                    <button
                        className='secondary-button'
                        ref={buttonRef}
                        onClick={() => {
                            follow();
                        }}>
                        Unfollow
                    </button>
                    :
                    <button
                        className='primary-button'
                        ref={buttonRef}
                        onClick={() => {
                            follow();
                        }}>
                        {
                            isOwn
                            ?
                            'Follow back'
                            :
                            'Follow'
                        }
                    </button>
                }
            </div>
        </div>
    )
}

export default UserCard;