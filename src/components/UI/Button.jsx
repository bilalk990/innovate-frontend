export default function Button({
    children,
    variant = 'primary',   // primary | secondary | danger
    size = '',             // '' | sm | lg
    loading = false,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <button className={`${size ? `btn-${size}` : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span
                />
            )}
            {children}
        </button>
    );
}
