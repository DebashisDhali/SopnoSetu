"use client";

import { useEffect, useState } from 'react';
import { Star, User } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
    _id: string;
    rating: number;
    comment: string;
    candidate: {
        name: string;
        email: string;
    };
    createdAt: string;
}

interface ReviewListProps {
    mentorId: string;
    refreshTrigger?: number;
}

export default function ReviewList({ mentorId, refreshTrigger }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [mentorId, refreshTrigger]);

    const fetchReviews = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/reviews/mentor/${mentorId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            setReviews(data);
        } catch (error: any) {
            setError(error.message || 'Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this mentor!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Reviews ({reviews.length})
            </h3>

            {reviews.map((review) => (
                <div
                    key={review._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {review.candidate.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                        {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-700 mt-3 leading-relaxed">
                        {review.comment}
                    </p>
                </div>
            ))}
        </div>
    );
}
