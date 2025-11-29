import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Heart, BookOpen, Calendar, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import "../styles/usersearch.css";
import { api } from "../../services/api";

/***********************
 * Local Types
 ***********************/
type SearchBook = {
  id: number;
  title: string;
  author: string;
  category: string;
  description?: string;
  availableCopies: number;
  totalCopies: number;
  location?: string;
  publishYear?: number;
  pages?: number;
  isbn?: string;
};

type ActionFeedback = {
  type: "success" | "error";
  message: string;
};

type CurrentUser = {
  id: number;
  fullName: string;
  userRole: "admin" | "user";
};

export function UserSearch() {
  /***********************
   * Local State
   ***********************/
  const [books, setBooks] = useState<SearchBook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(
    null
  );
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  /***********************
   * Hydrate session user from localStorage
   ***********************/
  const currentUser = useMemo<CurrentUser | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  /***********************
   * Fetch books from backend
   ***********************/
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getBooks();
      const mapped: SearchBook[] = (data || []).map((book: any) => ({
        id: book.book_id,
        title: book.title,
        author: book.author,
        category: book.genre || "Uncategorized",
        description:
          book.description || "No description available for this title.",
        availableCopies: book.available_copies ?? 0,
        totalCopies: book.total_copies ?? 0,
        location: book.shelf_location || "See librarian for location",
        publishYear: book.publication_year ?? undefined,
        pages: book.pages ?? undefined,
        isbn: book.isbn ?? undefined,
      }));

      mapped.sort((a, b) => a.title.localeCompare(b.title));
      setBooks(mapped);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load books right now."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  /***********************
   * Derived Lists
   ***********************/
  const categories = useMemo(() => {
    const unique = Array.from(new Set(books.map((book) => book.category)));
    return ["all", ...unique];
  }, [books]);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || book.category === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && book.availableCopies > 0) ||
      (availabilityFilter === "unavailable" && book.availableCopies === 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  /***********************
   * Helper: Availability display
   ***********************/
  const getAvailabilityLabel = (book: SearchBook) => {
    if (book.availableCopies === 0) return "Borrowed";
    if (book.availableCopies < 3) return "Low Stock";
    return "Available";
  };

  /***********************
   * ACTION HANDLERS
   ***********************/
  const handleReserve = async (bookId: number) => {
    if (!currentUser) {
      setActionFeedback({
        type: "error",
        message: "Please sign in to reserve a book.",
      });
      return;
    }

    setPendingActionId(bookId);
    setActionFeedback(null);

    try {
      await api.reserveBook(bookId, currentUser.id);
      setActionFeedback({
        type: "success",
        message:
          "Reservation placed successfully. We'll notify you when it's ready!",
      });
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to place reservation. Please try again.",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCheckout = async (bookId: number) => {
    if (!currentUser) {
      setActionFeedback({
        type: "error",
        message: "Please sign in to check out a book.",
      });
      return;
    }

    setPendingActionId(bookId);
    setActionFeedback(null);

    try {
      await api.checkoutBook(bookId, currentUser.id);
      setBooks((prev) =>
        prev.map((book) =>
          book.id === bookId
            ? {
                ...book,
                availableCopies:
                  book.availableCopies > 0 ? book.availableCopies - 1 : 0,
              }
            : book
        )
      );
      setActionFeedback({
        type: "success",
        message: "Checkout successful! Enjoy your book.",
      });
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Unable to check out the book. Please try again.",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleAddToFavorites = (bookId: number) => {
    alert(`Added book ${bookId} to favorites! (Coming soon)`);
  };

  const isActionPending = (bookId: number) => pendingActionId === bookId;
  const hasResults = filteredBooks.length > 0;

  return (
    <div className="usersearch-container">
      {/* Header */}
      <header className="usersearch-header">
        <h1>Search Books</h1>
        <p>Discover your next great read from our collection</p>
      </header>

      {/* Feedback for data fetch */}
      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>{error}</p>
          <button
            onClick={fetchBooks}
            style={{
              backgroundColor: "#991b1b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.35rem 0.75rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Show action feedback */}
      {actionFeedback && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid",
            borderColor:
              actionFeedback.type === "error" ? "#fecaca" : "#bbf7d0",
            backgroundColor:
              actionFeedback.type === "error" ? "#fee2e2" : "#dcfce7",
            color: actionFeedback.type === "error" ? "#991b1b" : "#14532d",
          }}
        >
          {actionFeedback.message}
        </div>
      )}

      {/* Filter Section */}
      <section className="usersearch-filters">
        <div className="filter-group">
          <div className="filter-search">
            <Search className="filter-icon" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="filter-select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select
            value={availabilityFilter}
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="filter-select">
              <SelectValue placeholder="All Books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="available">Available Now</SelectItem>
              <SelectItem value="unavailable">Currently Borrowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
      {/* Loading State */}
      {isLoading ? (
        <div className="results-summary">Loading books...</div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="results-summary">
            Found {filteredBooks.length} book
            {filteredBooks.length !== 1 ? "s" : ""}
          </div>

          {/* Book Grid */}
          <div className="book-grid">
            {filteredBooks.map((book) => {
              const availabilityLabel = getAvailabilityLabel(book);
              const isAvailable = book.availableCopies > 0;
              const isPending = isActionPending(book.id);

              return (
                <div key={book.id} className="book-card">
                  <div className="book-header">
                    <div>
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                    </div>
                    <button
                      className="favorite-btn"
                      onClick={() => handleAddToFavorites(book.id)}
                    >
                      <Heart />
                    </button>
                  </div>

                  <div className="book-tags">
                    <span className="tag">{book.category}</span>
                    <span
                      className={`tag ${
                        isAvailable ? "available" : "borrowed"
                      }`}
                    >
                      {availabilityLabel}
                    </span>
                  </div>

                  <p className="book-description">{book.description}</p>

                  <div className="book-details">
                    <div>
                      <Calendar /> Published{" "}
                      {book.publishYear ? book.publishYear : "TBD"}
                    </div>
                    <div>
                      <BookOpen /> {book.availableCopies} of{" "}
                      {book.totalCopies || 0} available
                    </div>
                    <div>
                      {book.pages ? `${book.pages} pages` : "Page count TBD"}
                    </div>
                    <div>
                      <MapPin /> Location: {book.location}
                    </div>
                    <div>ISBN: {book.isbn || "Pending"}</div>
                  </div>

                  <div className="book-actions">
                    <button
                      className="reserve-btn"
                      onClick={() => handleReserve(book.id)}
                      disabled={isPending}
                    >
                      {isPending ? "Processing..." : "Reserve Book"}
                    </button>
                    <button
                      className="details-btn"
                      onClick={() => handleCheckout(book.id)}
                      disabled={!isAvailable || isPending}
                    >
                      {isAvailable
                        ? isPending
                          ? "Processing..."
                          : "Checkout"
                        : "Unavailable"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!hasResults && (
            <div className="no-results">
              <BookOpen className="no-results-icon" />
              <h3>No books found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
