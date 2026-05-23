import './LengthIndicator.scss'

function LengthIndicator({ text, length, maxLength }) {
    const finalLength = text ? text.length : length ?? 0

    return (
        <p 
            className={
            `length-indicator ${finalLength > maxLength ? 'error' : ''}`}>
                {finalLength}/{maxLength}
            </p>
    )
}

export default LengthIndicator;