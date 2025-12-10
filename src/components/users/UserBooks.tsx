import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Loader2,
} from "lucide-react";
import "../styles/userBooks.css";
import { api } from "../../services/api";

type Loan = {
  loan_id: number; // Primary key
  copy_id: number;
  book_id: number;
  loan_date: string; // When checked out
  due_date: string;
  return_date?: string;
  status: string;
  book_title: string;
  book_author: string;
  book_cover?: string;
  is_overdue: boolean;
  days_remaining?: number;
};

type Reservation = {
  reservation_id: number; // Primary key
  book_id: number;
  reservation_date: string;
  position: number;
  status: string;
  book_title: string;
  book_author: string;
  book_cover?: string;
  available_copies: number;
};

export function UserBooks() {
  const [activeTab, setActiveTab] = useState("current");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user from localStorage
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loansData, reservationsData] = await Promise.all([
        api.getUserLoans(currentUser.id),
        api.getUserReservations(currentUser.id),
      ]);
      setLoans(loansData);
      setReservations(reservationsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your books"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentBooks = loans.filter((loan) => loan.status === "active");
  const bookHistory = loans.filter((loan) => loan.status === "returned");

  const overdueCount = currentBooks.filter((b) => b.is_overdue).length;
  const dueSoonCount = currentBooks.filter(
    (b) => !b.is_overdue && (b.days_remaining ?? 0) <= 3
  ).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusClass = (isOverdue: boolean, daysLeft?: number) => {
    if (isOverdue) return "badge badge-overdue";
    if (daysLeft !== undefined && daysLeft <= 3) return "badge badge-warning";
    return "badge badge-good";
  };

  if (!currentUser) {
    return (
      <div className="user-books-container">
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>Please sign in</h3>
          <p>You need to be signed in to view your books.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-books-container">
        <div className="empty-state">
          <Loader2 size={48} className="spinning" />
          <p>Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-books-container">
      <header className="header">
        <h1>Your Books</h1>
        <p>Manage your borrowed books, reservations, and reading history.</p>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <BookOpen className="icon blue" />
          <div>
            <p>Currently Reading</p>
            <h2>{currentBooks.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle className="icon yellow" />
          <div>
            <p>Due Soon / Overdue</p>
            <h2>{dueSoonCount + overdueCount}</h2>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="icon green" />
          <div>
            <p>Books Read</p>
            <h2>{bookHistory.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <Users className="icon purple" />
          <div>
            <p>Reservations</p>
            <h2>{reservations.length}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className="tab-buttons">
          <button
            onClick={() => setActiveTab("current")}
            className={activeTab === "current" ? "active" : ""}
          >
            Currently Reading ({currentBooks.length})
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={activeTab === "reservations" ? "active" : ""}
          >
            Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={activeTab === "history" ? "active" : ""}
          >
            Reading History ({bookHistory.length})
          </button>
        </div>

        {/* CURRENT LOANS */}
        {activeTab === "current" && (
          <div className="tab-content">
            {currentBooks.length === 0 ? (
              <div className="empty-tab">
                <BookOpen size={48} />
                <h3>No active loans</h3>
                <p>You don't have any books checked out right now.</p>
              </div>
            ) : (
              currentBooks.map((book) => (
                <div className="book-card" key={book.loan_id}>
                  <div className="book-header">
                    <div>
                      <h3>{book.book_title}</h3>
                      <p>by {book.book_author}</p>
                    </div>
                    <span
                      className={getStatusClass(
                        book.is_overdue,
                        book.days_remaining
                      )}
                    >
                      {book.is_overdue
                        ? `Overdue (${Math.abs(book.days_remaining ?? 0)} days)`
                        : `${book.days_remaining} days left`}
                    </span>
                  </div>
                  <div className="book-grid">
                    <div>
                      <p>
                        <Calendar size={16} /> Checked out:{" "}
                        {formatDate(book.loan_date)}
                      </p>
                      <p>
                        <Clock size={16} /> Due: {formatDate(book.due_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RESERVATIONS */}
        {activeTab === "reservations" && (
          <div className="tab-content">
            {reservations.length === 0 ? (
              <div className="empty-tab">
                <Users size={48} />
                <h3>No reservations</h3>
                <p>You don't have any book reservations at the moment.</p>
              </div>
            ) : (
              reservations.map((reservation) => (
                <div className="book-card" key={reservation.reservation_id}>
                  <div className="book-header">
                    <div>
                      <h3>{reservation.book_title}</h3>
                      <p>by {reservation.book_author}</p>
                    </div>
                    <span className="badge badge-info">
                      {reservation.status === "ready"
                        ? "Ready for pickup!"
                        : `Position #${reservation.position} in queue`}
                    </span>
                  </div>
                  <div className="book-grid">
                    <div>
                      <p>
                        <Calendar size={16} /> Reserved:{" "}
                        {formatDate(reservation.reservation_date)}
                      </p>
                      <p>
                        <BookOpen size={16} /> Available copies:{" "}
                        {reservation.available_copies}
                      </p>
                    </div>
                  </div>
                  {reservation.status === "ready" && (
                    <div className="ready-notice">
                      <CheckCircle size={18} />
                      <span>
                        Your book is ready! Please pick it up from the library.
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="tab-content">
            {bookHistory.length === 0 ? (
              <div className="empty-tab">
                <CheckCircle size={48} />
                <h3>No reading history</h3>
                <p>Your completed books will appear here.</p>
              </div>
            ) : (
              bookHistory.map((book) => (
                <div className="book-card" key={book.loan_id}>
                  <div className="book-header">
                    <div>
                      <h3>{book.book_title}</h3>
                      <p>by {book.book_author}</p>
                      <p className="dates">
                        Borrowed: {formatDate(book.loan_date)} • Returned:{" "}
                        {book.return_date && formatDate(book.return_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
