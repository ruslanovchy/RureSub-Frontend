import './ErrorIndicator.scss'

function ErrorIndicator({ errors, propName }) {
    return (
        <div>
            {Object.hasOwn(errors, propName) && <p className="error-indicator-paragraph">{errors[propName]}</p>}
        </div>
    )
}

export default ErrorIndicator;