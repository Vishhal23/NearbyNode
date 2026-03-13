import React from 'react';

/**
 * StarRating — Interactive + readonly star rating component
 * @param {number} rating - Current rating value (1-5)
 * @param {function} onRate - Callback when clicked (omit for readonly)
 * @param {boolean} readonly - Disable interaction
 * @param {string} size - 'sm', 'md', 'lg'
 */
const StarRating = ({ rating = 0, onRate, readonly = false, size = 'md' }) => {
    const sizes = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
    };

    return (
        <div className={`flex items-center gap-0.5 ${readonly ? '' : 'cursor-pointer'}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => !readonly && onRate && onRate(star)}
                    onMouseEnter={(e) => {
                        if (!readonly && onRate) e.target.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                        if (!readonly && onRate) e.target.style.transform = 'scale(1)';
                    }}
                    className={`${sizes[size]} transition-all duration-150 ${star <= Math.floor(rating)
                            ? 'text-amber-400'
                            : star - 0.5 <= rating
                                ? 'text-amber-300'
                                : 'text-gray-200'
                        } ${!readonly ? 'hover:text-amber-400' : ''}`}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
