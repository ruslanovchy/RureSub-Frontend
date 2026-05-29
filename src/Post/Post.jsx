import { useQuery } from '@tanstack/react-query';
import './Post.scss'
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { toPostDateFormat } from '../utils/dateFormat';
import TipTap from '../Components/TipTap/TipTap';
import { useEffect, useState } from 'react';
import { toIndicatorFormat } from '../utils/indicatorFormat';
import { icons } from '../assets/icons/icons';

async function fetchPost(id) {
    const response = await api.get(`posts?id=${id}`)
    return response.data;
}

function Post() {
    const pathParams = useParams();

    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: ['post', pathParams.id],
        queryFn: () => fetchPost(pathParams.id),
    })

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);

    useEffect(() => {
        if (data) {
            setIsLiked(data.isLiked);
            setLikesCount(data.likesCount);
            setCommentsCount(data.commentsCount);
        }
    }, [data])

    if (isLoading || error) return;

    
    function like() {

    }

    console.log(data);

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
                                isLiked ?
                                icons.heartFilledIcon : icons.heartIcon} alt="" />
                            <span>{toIndicatorFormat(likesCount)}</span>
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
            </div>
        </div>
    )
}

export default Post;