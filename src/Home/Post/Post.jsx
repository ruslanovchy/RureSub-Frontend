
function Post({ data }) {
    return (
        <div className="post-container">
            <div className="post-header">

            </div>
            <div className="body">
                <p>
                {   JSON.stringify(data.content)}
                </p>
            </div>
            <div className="footer">

            </div>
        </div>
    )
}

export default Post;