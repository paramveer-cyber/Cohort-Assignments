'use client';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const buttonStyle = (disabled: boolean) => ({
        padding: '7px 14px',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? '#d1d5db' : '#374151',
        fontWeight: 600,
        fontSize: 13,
    });

    const windowStart = Math.max(1, Math.min(currentPage - 3, totalPages - 6));
    const pageNumbers = Array.from(
        { length: Math.min(7, totalPages) },
        (_, index) => windowStart + index
    );

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
            }}
        >
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage <= 1}
                style={{
                    ...buttonStyle(currentPage <= 1),
                    padding: '7px 12px',
                }}
            >
                «
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                style={buttonStyle(currentPage <= 1)}
            >
                &lt; Prev
            </button>

            {pageNumbers.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        background:
                            pageNumber === currentPage ? '#c0392b' : 'white',
                        color: pageNumber === currentPage ? 'white' : '#374151',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        minWidth: 36,
                    }}
                >
                    {pageNumber}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={buttonStyle(currentPage >= totalPages)}
            >
                Next &gt;
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage >= totalPages}
                style={{
                    ...buttonStyle(currentPage >= totalPages),
                    padding: '7px 12px',
                }}
            >
                »
            </button>
            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                Page {currentPage} / {totalPages}
            </span>
        </div>
    );
}
