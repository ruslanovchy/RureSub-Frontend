import { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../Profile";
import defaultAvatar from '../../assets/user-default-avatar.png'
import defaultBanner from '../../assets/user-default-banner.jpg'
import penIcon from '../../assets/icons/pen.svg'
import './ProfileHeader.scss'
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useCheckAuthorize } from "../../hooks/useAuthorizeCheck";
import { api } from "../../api";
import { queryClient } from "../../App";
import { useMutation } from "@tanstack/react-query";

function ProfileHeader() {
    const navigate = useNavigate();
    const context = useContext(ProfileContext);
    const [avatarSrc, setAvatarSrc] = useState(context.profileData.avatarUrl ?? assets.userDefaultAvatar);
    const [bannerSrc, setBannerSrc] = useState(context.profileData.bannerUrl ?? assets.userDefaultBanner);
    const checkAuthorize = useCheckAuthorize();
    const feedQueryKey = ['feed']

    useEffect(() => {
        if (context.profileData) {
            setAvatarSrc(context.profileData?.avatarUrl ?? assets.userDefaultAvatar);
            setBannerSrc(context.profileData?.bannerUrl ?? assets.userDefaultBanner);
        }
    }, [context.profileData])

    const followMutation = useMutation({
        mutationFn: async ({ authorId, isFollowed }) => {
            const url = `followers?followingId=${authorId}`;

            if (isFollowed) {
                return await api.delete(url);
            }

            return await api.post(url);
        },
        onMutate: async ({ authorId }) => {
            await queryClient.cancelQueries({ queryKey: context.queryKey });

            const previousData = queryClient.getQueryData(context.queryKey);
            const previousFeedData = queryClient.getQueryData(feedQueryKey);

            queryClient.setQueryData(context.queryKey,
                (oldData) => {
                    const newIsFollowed = !oldData.isFollowed;

                    return {
                        ...oldData,
                        isFollowed: newIsFollowed,
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
                                if (post.authorId !== authorId) {
                                    return post;
                                }

                                const newIsFollowed = !post.isFollowed;

                                return {
                                    ...post,
                                    isFollowed: newIsFollowed
                                }
                            })
                        )
                    }
                }
            )

            return { previousFeedData, previousData }
        },
        onError: (err, variables, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousData);
                queryClient.setQueryData(feedQueryKey, context.previousFeedData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries(context.queryKey);
            queryClient.invalidateQueries(feedQueryKey);
        }
    });

    function follow() {
        if (!checkAuthorize()) return;
        followMutation.mutate({
            authorId: context.profileData.userId,
            isFollowed: context.profileData.isFollowed
        })
    }


    return (
        <div className='profile-header'>
            <img className='banner' src={bannerSrc}
                onError={() => { setBannerSrc(assets.userDefaultBanner); }} alt="" />
            <div className="main-info">
                <div className="left">
                    <div className="avatar">
                        <img 
                            className='avatar-image' 
                            src={avatarSrc} 
                            onError={() => { setAvatarSrc(assets.userDefaultAvatar); }}
                            alt="" />
                    </div>

                    <div className="names">
                        <p className="display-name-p">
                            {context.profileData.displayName}
                        </p>
                        
                        <p className="user-name-p">
                            @{context.profileData.userName}
                        </p>
                    </div>
                    {context.isProfileOwner && 
                    <div className="additional-buttons">
                        <button className="change-profile-button"
                            onClick={()=>{
                                navigate('/settings/profile')
                            }}>
                            <img src={penIcon} alt="" />
                        </button>
                    </div>}
                </div>
                <div className="right">
                    <div className="follow-button-wrapper">
                        {
                            !context.isProfileOwner 
                            && (
                                context.profileData.isFollowed 
                                ?
                                <button 
                                    className="secondary-button follow-button"
                                    onClick={follow}>
                                    Unfollow
                                </button>
                                :
                                <button 
                                    className="primary-button follow-button"
                                    onClick={follow}>
                                    Follow
                                </button>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileHeader;