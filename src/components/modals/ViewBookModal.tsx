/*********************************
 * File Name: ViewBookModal.tsx
 * About:
 *   Shared popup modal for viewing book details.
 *   - Admin: read-only view
 *   - User: view + Loan Book button + feedback box
 *********************************/
import { useEffect } from "react";
import "./ViewBookModal.css";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface ViewBookModalProps {
  book: any;
  mode: "admin" | "user";
  onClose: () => void;

  // User-only features
  onLoan?: (bookId: number) => Promise<void>;
  loanFeedback?: string | null;
}

export function ViewBookModal({
  book,
  mode,
  onClose,
  onLoan,
  loanFeedback,
}: ViewBookModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  if (!book) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <Card>
          <CardHeader>
            <CardTitle className="modal-title">{book.title}</CardTitle>
          </CardHeader>

          <CardContent>
            {book.cover_url && (
              <div className="modal-cover-image">
                <img
                  src={`http://localhost:3000${book.cover_url}`}
                  alt={`${book.title} cover`}
                />
              </div>
            )}
            <div className="modal-details">
              <p>
                <strong>Author:</strong> {book.author}
              </p>
              <p>
                <strong>ISBN:</strong> {book.isbn}
              </p>
              <p>
                <strong>Publisher:</strong> {book.publisher}
              </p>
              <p>
                <strong>Year:</strong> {book.publication_year}
              </p>
              <p>
                <strong>Category:</strong> {book.genre}
              </p>
              <p>
                <strong>Pages:</strong> {book.pages}
              </p>
              <p>
                <strong>Location:</strong> {book.location}
              </p>

              <div className="modal-description">
                <strong>Description:</strong>
                <p>{book.description}</p>
              </div>
            </div>

            {/* USER MODE ONLY — Loan Book button */}
            {mode === "user" && (
              <>
                <Button
                  className="modal-loan-btn"
                  onClick={() => onLoan && onLoan(book.book_id)}
                >
                  Loan Book
                </Button>

                {/* Inline feedback box */}
                {loanFeedback && (
                  <div
                    className={
                      loanFeedback.includes("successful")
                        ? "loan-feedback success"
                        : "loan-feedback error"
                    }
                  >
                    {loanFeedback}
                  </div>
                )}
              </>
            )}

            {/* Close button (admins + users) */}
            <Button className="modal-close-btn" onClick={onClose}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
