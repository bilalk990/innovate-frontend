export default function Input({
    label,
    error,
    className = '',
    type = 'text',
    ...props
}) {
    return (
        <div>
            {label && <label>{label}</label>}
            <input type={type} {...props} />
            {error && <span>{error}</span>}
        </div>
    );
}
