import React from "react";
import { BookOpen, Calendar, MapPin, Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import "../styles/AdminBookCard.css";

type AdminBookCardProps = {
  book: {
    book_id: number;
    title: string;
    author: string;
    genre: string | null;
    description?: string;
    cover_url?: string;
    available_copies: number;
    total_copies: number;
    location: string | null;
    publication_year?: number;
    isbn: string;
    status: string;
  };
  onEdit: (book: any) => void;
  onView: (book: any) => void;
  onDelete: (bookId: number) => void;
};

export function AdminBookCard({
  book,
  onEdit,
  onView,
  onDelete,
}: AdminBookCardProps) {
  // Determine status badge styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "admin-status-available";
      case "Low Stock":
        return "admin-status-low";
      case "Out of Stock":
        return "admin-status-out";
      default:
        return "admin-status-default";
    }
  };

  return (
    <div className="admin-book-card">
      {/* Book Cover */}
      <div className="admin-book-cover">
        {book.cover_url ? (
          <img
            src={`http://localhost:3000${book.cover_url}`}
            alt={`${book.title} cover`}
          />
        ) : (
          <BookOpen className="admin-book-cover-placeholder" />
        )}
      </div>

      {/* Book Content */}
      <div className="admin-book-content">
        {/* Header with Title and Author */}
        <div className="admin-book-header">
          <div>
            <h3 className="admin-book-title">{book.title}</h3>
            <p className="admin-book-author">by {book.author}</p>
          </div>
        </div>

        {/* Tags: Category + Status */}
        <div className="admin-book-tags">
          <Badge className="admin-tag">{book.genre}</Badge>
          <Badge className={`admin-tag ${getStatusColor(book.status)}`}>
            {book.status}
          </Badge>
        </div>

        {/* Description - Line Clamped to 2 Lines */}
        {book.description && (
          <p className="admin-book-description">{book.description}</p>
        )}

        {/* Book Details */}
        <div className="admin-book-details">
          {book.publication_year && (
            <div>
              <Calendar />
              <span>{book.publication_year}</span>
            </div>
          )}
          <div>
            <BookOpen />
            <span>
              {book.available_copies} of {book.total_copies} available
            </span>
          </div>
          {book.location && (
            <div>
              <MapPin />
              <span>{book.location}</span>
            </div>
          )}
          <div>
            <span>ISBN: {book.isbn}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="admin-book-actions">
          <button
            className="admin-action-btn admin-edit-btn"
            onClick={() => onEdit(book)}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            className="admin-action-btn admin-view-btn"
            onClick={() => onView(book)}
          >
            <Eye size={16} />
            View Book
          </button>
          <button
            className="admin-action-btn admin-delete-btn"
            onClick={() => onDelete(book.book_id)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
