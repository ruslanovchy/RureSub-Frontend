import './LoadingCircle.scss'

function LoadingCircle({ hasNextPage }) {
    return (
        <div
            className={`loading-circle-container ${hasNextPage ? '' : 'hidden'}`}>
            <div className='circle'></div>
        </div>
    )
}

export default LoadingCircle;