import React, { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { Search, Heart, BookOpen, Calendar, MapPin } from "lucide-react";
import "../styles/usersearch.css"; 

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const mockBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Literature",
      description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
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
      description: "A gripping tale of racial injustice and childhood innocence in the American South.",
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
      description: "A dystopian novel about totalitarianism and surveillance in a future society.",
      available: false,
      totalCopies: 4,
      availableCopies: 0,
      location: "B-05",
      rating: 4.4,
      publishYear: 1949,
      pages: 328,
    },
  ];

  const categories = ["all", "Fiction", "Literature", "Science", "Non-Fiction", "History"];

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;

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
      <header className="usersearch-header">
        <h1>Search Books</h1>
        <p>Discover your next great read from our collection</p>
      </header>

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
          <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
            <Select.Trigger className="filter-select">
              <Select.Value placeholder="All Categories" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="select-dropdown">
                <Select.Viewport>
                  {categories.map((category) => (
                    <Select.Item key={category} value={category} className="select-item">
                      <Select.ItemText>
                        {category === "all" ? "All Categories" : category}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          {/* Availability Filter */}
          <Select.Root value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <Select.Trigger className="filter-select">
              <Select.Value placeholder="All Books" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="select-dropdown">
                <Select.Viewport>
                  <Select.Item value="all" className="select-item">
                    <Select.ItemText>All Books</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="available" className="select-item">
                    <Select.ItemText>Available Now</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="unavailable" className="select-item">
                    <Select.ItemText>Currently Borrowed</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </section>

      {/* Results Summary */}
      <div className="results-summary">
        Found {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
      </div>

      {/* Book Grid */}
      <div className="book-grid">
        {filteredBooks.map((book) => (
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
              <span className={`tag ${book.available ? "available" : "borrowed"}`}>
                {book.available ? "Available" : "Borrowed"}
              </span>
            </div>

            <p className="book-description">{book.description}</p>

            <div className="book-details">
              <div>
                <Calendar /> Published {book.publishYear} • {book.pages} pages
              </div>
              <div>
                <MapPin /> Location: {book.location}
              </div>
              <div>
                <BookOpen /> {book.availableCopies} of {book.totalCopies} available
              </div>
              <div>★ {book.rating}/5</div>
            </div>

            <div className="book-actions">
              <button
                className="reserve-btn"
                onClick={() => handleReserve(book.id)}
                disabled={!book.available}
              >
                {book.available ? "Reserve Book" : "Currently Unavailable"}
              </button>
              <button className="details-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-results">
          <BookOpen className="no-results-icon" />
          <h3>No books found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}
