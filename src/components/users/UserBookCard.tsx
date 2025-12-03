import React from "react";
import { Heart, BookOpen, Calendar, MapPin } from "lucide-react";
import "../styles/UserBookCard.css";

type BookCardProps = {
  book: {
    id: number;
    title: string;
    author: string;
    genre: string;
    description?: string;
    cover_url?: string;
    availableCopies: number;
    totalCopies: number;
    location?: string;
    publication_year?: number;
    pages?: number;
  };
  onCheckout: (bookId: number) => void;
  onViewDetails: (bookId: number) => void;
  onFavorite?: (bookId: number) => void;
  isPending?: boolean;
};

export function BookCard({
  book,
  onCheckout,
  onViewDetails,
  onFavorite,
  isPending = false,
}: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  // Determine availability label
  const getAvailabilityLabel = () => {
    if (book.availableCopies === 0) return "Borrowed";
    if (book.availableCopies < 3) return "Low Stock";
    return "Available";
  };

  const availabilityLabel = getAvailabilityLabel();

  return (
    <div className="book-card">
      {/* Book Cover */}
      <div className="book-cover">
        {book.cover_url ? (
          <img src={book.cover_url} alt={`${book.title} cover`} />
        ) : (
          <BookOpen className="book-cover-placeholder" />
        )}
      </div>

      {/* Book Content */}
      <div className="book-content">
        {/* Header with Title, Author, and Favorite */}
        <div className="book-header">
          <div>
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">by {book.author}</p>
          </div>
          {onFavorite && (
            <button
              className="favorite-btn"
              onClick={() => onFavorite(book.id)}
              aria-label="Add to favorites"
            >
              <Heart />
            </button>
          )}
        </div>

        {/* Tags: Category + Availability */}
        <div className="book-tags">
          <span className="tag">{book.genre}</span>
          <span className={`tag ${isAvailable ? "available" : "borrowed"}`}>
            {availabilityLabel}
          </span>
        </div>

        {/* Description - Line Clamped to 2 Lines */}
        {book.description && (
          <p className="book-description">{book.description}</p>
        )}

        {/* Book Details */}
        <div className="book-details">
          {book.publication_year && (
            <div>
              <Calendar />
              <span>{book.publication_year}</span>
            </div>
          )}
          <div>
            <BookOpen />
            <span>
              {book.availableCopies} of {book.totalCopies} available
            </span>
          </div>
          {book.pages && (
            <div>
              <span>{book.pages} pages</span>
            </div>
          )}
          {book.location && (
            <div>
              <MapPin />
              <span>{book.location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="book-actions">
          <button
            className="reserve-btn"
            onClick={() => onCheckout(book.id)}
            disabled={isPending}
          >
            {isPending
              ? "Processing..."
              : isAvailable
              ? "Checkout Book"
              : "Reserve Book"}
          </button>

          <button
            className="details-btn"
            onClick={() => onViewDetails(book.id)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
