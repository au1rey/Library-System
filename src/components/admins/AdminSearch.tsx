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

export function AdminSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const mockBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      category: "Literature",
      status: "Available",
      copies: 3,
      borrowed: 1,
      location: "A-15",
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      category: "Literature",
      status: "Available",
      copies: 2,
      borrowed: 0,
      location: "A-16",
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      category: "Fiction",
      status: "Low Stock",
      copies: 1,
      borrowed: 3,
      location: "B-05",
    },
    {
      id: 4,
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      isbn: "978-0-553-10953-5",
      category: "Science",
      status: "Available",
      copies: 2,
      borrowed: 1,
      location: "C-22",
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "978-0-316-76948-0",
      category: "Literature",
      status: "Out of Stock",
      copies: 0,
      borrowed: 2,
      location: "A-18",
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
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);

    const matchesCategory =
      categoryFilter === "all" || book.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "status-available";
      case "Low Stock":
        return "status-low";
      case "Out of Stock":
        return "status-out";
      default:
        return "status-default";
    }
  };

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
        Showing {filteredBooks.length} of {mockBooks.length} books
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="book-info">
                      <p className="book-title">{book.title}</p>
                      <p className="book-meta">by {book.author}</p>
                      <p className="book-meta">ISBN: {book.isbn}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{book.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(book.status)}>
                      {book.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="book-copies">
                      <p>Available: {book.copies}</p>
                      <p className="book-meta">Borrowed: {book.borrowed}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{book.location}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="action-buttons">
                      <Button>
                        <Eye size={16} />
                      </Button>
                      <Button>
                        <Edit size={16} />
                      </Button>
                      <Button>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      <div className="admin-actions">
        <Button>
          <BookOpen size={16} />
          Export Results
        </Button>
        <Button>Bulk Edit</Button>
      </div>
    </div>
  );
}
