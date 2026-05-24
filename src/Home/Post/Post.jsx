import { useNavigate } from "react-router-dom";
import TipTap from "../../Components/TipTap/TipTap";
import { useRef } from "react";

function Post({ data }) {
    const navigate = useNavigate();
    const tipTapRef = useRef();

    return (
        <div className="post-container">

            <div className="post-header">
                <div 
                    className="left"
                    onClick={(e) => {
                        navigate(`/user/${data.author.userName}`)
                    }}>
                    <img src={data.author.avatarUrl} alt="" />

                    <div className="names">
                        <span className="display-name">{data.author.displayName}</span>
                        <span className="user-name">@{data.author.userName}</span>
                    </div>
                </div>
                <div className="right">
                    <button className="secondary-button">
                        Follow
                    </button>
                </div>
                <div className="right">

                </div>
            </div>

            <div className="body">
                <h2>{data.title}</h2>
                <TipTap
                    editable={false}
                    ref={tipTapRef}
                    content={data.content}/>
            </div>

            <div className="footer">

            </div>
        </div>
    )
}

export default Post;