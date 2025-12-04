import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import type { BookWithCopies } from "../../../backend/models/BooksWithCopies";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search, Edit, Trash2, Eye, BookOpen } from "lucide-react";
import "../styles/AdminSearch.css";
import { ViewBookModal } from "../modals/ViewBookModal";
import { EditBookModal } from "../modals/EditBookModal";
import { AdminBookCard } from "./AdminBookCard";

export function AdminSearch() {
  const [books, setBooks] = useState<BookWithCopies[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState<BookWithCopies | null>(null);
  const [editingBook, setEditingBook] = useState<BookWithCopies | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch(
          "http://localhost:3000/api/books/books-with-copies"
        );
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        console.log("Fetched data:", data);
        setBooks(data);
      } catch (err: any) {
        console.error("Error fetching books:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const categories = [
    "all",
    "Fiction",
    "Literature",
    "Science",
    "Non-Fiction",
    "History",
  ];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);

    const matchesCategory =
      categoryFilter === "all" || book.genre === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Helper to get status badge color/*
  //const getStatusColor = (status: string) => {
  //switch (status) {
  //case "Available":
  //return "status-available";
  //case "Low Stock":
  //return "status-low";
  //case "Out of Stock":
  //return "status-out";
  //default:
  //return "status-default";
  //}
  //};

  // Handle delete book
  async function handleDelete(bookId: number) {
    if (
      !confirm("Are you sure you want to delete this book and all its copies?")
    )
      return;

    try {
      const res = await fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete book");

      // Remove from local state so table updates immediately
      setBooks(books.filter((b) => b.book_id !== bookId));
    } catch (err: any) {
      console.error(err);
      alert("Error deleting book");
    }
  }

  function handleViewBook(book: BookWithCopies) {
    setSelectedBook(book);
  }

  function handleEditBook(book: BookWithCopies) {
    setEditingBook(book);
  }

  function handleSaveEdit(updatedBook: BookWithCopies) {
    // Update the book in the local state with full BookWithCopies structure
    setBooks(
      books.map((b) =>
        b.book_id === updatedBook.book_id
          ? {
              ...updatedBook,
              // Ensure all required fields are present
              status: updatedBook.status || "Available",
              location: updatedBook.location || b.location,
              available_copies:
                updatedBook.available_copies ?? b.available_copies,
              total_copies: updatedBook.total_copies ?? b.total_copies,
              borrowed: updatedBook.borrowed ?? b.borrowed,
            }
          : b
      )
    );
    setEditingBook(null);
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Search & Manage Books</h1>
        <p>Search, view, and manage all books in the library catalog</p>
      </div>

      {/* Search & Filter */}
      <Card className="admin-search-card">
        <CardHeader>
          <CardTitle className="admin-card-title">
            <Search size={18} />
            <span>Search Books</span>
          </CardTitle>
          <CardDescription>Search by title, author, or ISBN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="admin-controls">
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="admin-results">
        Showing {filteredBooks.length} of {books.length} books
      </div>

      {/* Book Cards Grid */}
      <div className="admin-books-grid">
        {filteredBooks.map((book) => (
          <AdminBookCard
            key={book.book_id}
            book={book}
            onEdit={handleEditBook}
            onView={handleViewBook}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Bulk actions */}
      <div className="admin-actions">
        <Button>
          <BookOpen size={16} />
          Export Results
        </Button>
        <Button>Bulk Edit</Button>
      </div>

      {/* VIEW BOOK MODAL */}
      {selectedBook && (
        <ViewBookModal
          book={selectedBook}
          mode="admin"
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* EDIT BOOK MODAL */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
