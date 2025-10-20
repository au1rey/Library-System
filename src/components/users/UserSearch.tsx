import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectItem } from "../ui/select";
import { Search, Heart, BookOpen, Calendar, MapPin } from "lucide-react";
import "../styles/usersearch.css";

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Mock book data
  const mockBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Literature",
      description:
        "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
      available: true,
      totalCopies: 3,
      availableCopies: 2,
      location: "A-15",
      rating: 4.2,
      publishYear: 1925,
      pages: 180,
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      category: "Literature",
      description:
        "A gripping tale of racial injustice and childhood innocence in the American South.",
      available: true,
      totalCopies: 2,
      availableCopies: 2,
      location: "A-16",
      rating: 4.5,
      publishYear: 1960,
      pages: 324,
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      category: "Fiction",
      description:
        "A dystopian novel about totalitarianism and surveillance in a future society.",
      available: false,
      totalCopies: 4,
      availableCopies: 0,
      location: "B-05",
      rating: 4.4,
      publishYear: 1949,
      pages: 328,
    },
    {
      id: 4,
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      category: "Science",
      description:
        "An accessible explanation of cosmology, black holes, and the nature of time.",
      available: true,
      totalCopies: 2,
      availableCopies: 1,
      location: "C-22",
      rating: 4.1,
      publishYear: 1988,
      pages: 256,
    },
    {
      id: 5,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      category: "Literature",
      description:
        "A romantic novel about love, class, and social expectations in 19th century England.",
      available: true,
      totalCopies: 3,
      availableCopies: 1,
      location: "A-12",
      rating: 4.3,
      publishYear: 1813,
      pages: 432,
    },
    {
      id: 6,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      category: "Literature",
      description:
        "A coming-of-age story following teenager Holden Caulfield in New York City.",
      available: false,
      totalCopies: 2,
      availableCopies: 0,
      location: "A-18",
      rating: 3.8,
      publishYear: 1951,
      pages: 277,
    },
  ];

  const categories = [
    "all",
    "Fiction",
    "Literature",
    "Science",
    "Non-Fiction",
    "History",
  ];

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || book.category === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && book.available) ||
      (availabilityFilter === "unavailable" && !book.available);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleReserve = (bookId: number) => {
    alert(`Book reserved successfully! (Demo mode)`);
  };

  const handleAddToFavorites = (bookId: number) => {
    alert(`Added to favorites! (Demo mode)`);
  };

  return (
    <div className="usersearch-container">
      {/* Header */}
      <div className="usersearch-header">
        <h1>Search Books</h1>
        <p>Discover your next great read from our extensive collection</p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="usersearch-filter-card">
        <CardHeader>
          <CardTitle className="usersearch-filter-title">
            <Search className="usersearch-filter-icon" />
            Find Your Next Book
          </CardTitle>
          <CardDescription>
            Search by title, author, or browse by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="usersearch-controls">
            <div className="usersearch-search-row">
              <div className="usersearch-search-input">
                <Input
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="usersearch-filter-row">
              <Select
                className="usersearch-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </Select>
              <Select
                className="usersearch-filter-select"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="available">Available Now</SelectItem>
                <SelectItem value="unavailable">Currently Borrowed</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="usersearch-results-summary">
        <p>
          Found {filteredBooks.length} book
          {filteredBooks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Books Grid */}
      <div className="usersearch-books-grid">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="usersearch-book-card">
            <CardHeader>
              <div className="usersearch-book-header">
                <div className="usersearch-book-info">
                  <h3 className="usersearch-book-title">{book.title}</h3>
                  <p className="usersearch-book-author">by {book.author}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="usersearch-favorite-btn"
                  onClick={() => handleAddToFavorites(book.id)}
                >
                  <Heart className="usersearch-favorite-icon" />
                </Button>
              </div>
              <div className="usersearch-badges">
                <Badge variant="outline">{book.category}</Badge>
                <Badge variant={book.available ? "default" : "secondary"}>
                  {book.available ? "Available" : "Borrowed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="usersearch-book-description">{book.description}</p>

              <div className="usersearch-book-details">
                <div className="usersearch-book-detail-item">
                  <Calendar className="usersearch-detail-icon" />
                  <span>
                    Published {book.publishYear} • {book.pages} pages
                  </span>
                </div>
                <div className="usersearch-book-detail-item">
                  <MapPin className="usersearch-detail-icon" />
                  <span>Location: {book.location}</span>
                </div>
                <div className="usersearch-book-detail-item">
                  <BookOpen className="usersearch-detail-icon" />
                  <span>
                    {book.availableCopies} of {book.totalCopies} available
                  </span>
                </div>
                <div className="usersearch-book-detail-item">
                  <span className="usersearch-rating-star">★</span>
                  <span>{book.rating}/5</span>
                </div>
              </div>

              <div className="usersearch-book-actions">
                {book.available ? (
                  <Button
                    className="usersearch-full-btn"
                    onClick={() => handleReserve(book.id)}
                  >
                    Reserve Book
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="usersearch-full-btn"
                    disabled
                  >
                    Currently Unavailable
                  </Button>
                )}
                <Button variant="ghost" className="usersearch-full-btn">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <Card className="usersearch-empty-state">
          <CardContent>
            <BookOpen className="usersearch-empty-icon" />
            <h3>No books found</h3>
            <p>Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
