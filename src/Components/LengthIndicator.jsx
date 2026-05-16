import './LengthIndicator.scss'

function LengthIndicator({ text, maxLength }) {
    return (
        <p className={`length-indicator ${text.length > maxLength ? 'error' : ''}`}>{text.length}/{maxLength}</p>
    )
}

export default LengthIndicator;