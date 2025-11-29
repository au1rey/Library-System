import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Star,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import "../styles/userBooks.css";

export function UserBooks() {
  const [activeTab, setActiveTab] = useState("current");

  const currentBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      borrowDate: "Nov 15, 2024",
      dueDate: "Dec 15, 2024",
      daysLeft: 18,
      progress: 65,
      renewals: 0,
      maxRenewals: 2,
      status: "reading",
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      borrowDate: "Nov 20, 2024",
      dueDate: "Dec 20, 2024",
      daysLeft: 23,
      progress: 30,
      renewals: 1,
      maxRenewals: 2,
      status: "reading",
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      borrowDate: "Oct 25, 2024",
      dueDate: "Nov 25, 2024",
      daysLeft: -2,
      progress: 80,
      renewals: 2,
      maxRenewals: 2,
      status: "overdue",
    },
  ];

  const bookHistory = [
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      borrowDate: "Sep 1, 2024",
      returnDate: "Sep 28, 2024",
      rating: 5,
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      borrowDate: "Aug 15, 2024",
      returnDate: "Sep 10, 2024",
      rating: 4,
    },
    {
      id: 6,
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      borrowDate: "Jul 20, 2024",
      returnDate: "Aug 12, 2024",
      rating: 5,
    },
  ];

  const favorites = [
    {
      id: 7,
      title: "Dune",
      author: "Frank Herbert",
      category: "Science Fiction",
      available: true,
      rating: 4.6,
    },
    {
      id: 8,
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      category: "Fantasy",
      available: false,
      rating: 4.8,
    },
  ];

  const handleRenew = (id: number) => alert(`Book renewed successfully!`);
  const handleReturn = (id: number) => alert(`Book returned successfully!`);
  const handleReserve = (id: number) => alert(`Book reserved successfully!`);

  const getStatusClass = (status: string, daysLeft: number) => {
    if (status === "overdue") return "badge badge-overdue";
    if (daysLeft <= 3) return "badge badge-warning";
    return "badge badge-good";
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`star ${i < rating ? "filled" : ""}`} />
    ));

  return (
    <div className="user-books-container">
      <header className="header">
        <h1>Your Books</h1>
        <p>Manage your borrowed books, reading history, and favorites.</p>
      </header>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <BookOpen className="icon blue" />
          <div>
            <p>Currently Reading</p>
            <h2>3</h2>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle className="icon yellow" />
          <div>
            <p>Due Soon</p>
            <h2>1</h2>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="icon green" />
          <div>
            <p>Books Read</p>
            <h2>12</h2>
          </div>
        </div>
        <div className="stat-card">
          <Star className="icon purple" />
          <div>
            <p>Favorites</p>
            <h2>8</h2>
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
            Currently Reading
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={activeTab === "history" ? "active" : ""}
          >
            Reading History
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={activeTab === "favorites" ? "active" : ""}
          >
            Favorites
          </button>
        </div>

        {/* CURRENT */}
        {activeTab === "current" && (
          <div className="tab-content">
            {currentBooks.map((book) => (
              <div className="book-card" key={book.id}>
                <div className="book-header">
                  <div>
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                  </div>
                  <span className={getStatusClass(book.status, book.daysLeft)}>
                    {book.status === "overdue"
                      ? "Overdue"
                      : `${book.daysLeft} days left`}
                  </span>
                </div>
                <div className="book-grid">
                  <div>
                    <p>
                      <Calendar size={16} /> Borrowed: {book.borrowDate}
                    </p>
                    <p>
                      <Clock size={16} /> Due: {book.dueDate}
                    </p>
                    <p>
                      <RotateCcw size={16} /> Renewals: {book.renewals}/
                      {book.maxRenewals}
                    </p>
                  </div>
                  <div></div>
                  <div className="book-actions">
                    {book.renewals < book.maxRenewals && (
                      <button
                        className="btn-outline"
                        onClick={() => handleRenew(book.id)}
                      >
                        Renew
                      </button>
                    )}
                    <button
                      className="btn"
                      onClick={() => handleReturn(book.id)}
                    >
                      Return
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="tab-content">
            {bookHistory.map((book) => (
              <div className="book-card" key={book.id}>
                <div className="book-header">
                  <div>
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                    <p className="dates">
                      Borrowed: {book.borrowDate} • Returned: {book.returnDate}
                    </p>
                  </div>
                  <div className="rating">{renderStars(book.rating)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAVORITES */}
        {activeTab === "favorites" && (
          <div className="tab-content favorites-grid">
            {favorites.map((book) => (
              <div className="book-card" key={book.id}>
                <div className="book-header">
                  <div>
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                    <span className="badge badge-outline">{book.category}</span>
                  </div>
                  <div className="rating">
                    {renderStars(Math.floor(book.rating))}
                    <p>{book.rating}/5</p>
                  </div>
                </div>
                <div className="book-actions">
                  <button
                    className={book.available ? "btn" : "btn-outline disabled"}
                    onClick={() => handleReserve(book.id)}
                    disabled={!book.available}
                  >
                    {book.available ? "Reserve" : "Unavailable"}
                  </button>
                  <button className="btn-ghost">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
