import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BookOpen } from "lucide-react";
import type { BookWithCopies } from "../../../backend/models/BooksWithCopies";
import "./EditBookModal.css";

interface EditBookModalProps {
  book: BookWithCopies;
  onClose: () => void;
  onSave: (updatedBook: BookWithCopies) => void;
}

export function EditBookModal({ book, onClose, onSave }: EditBookModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publication_year: "",
    genre: "",
    description: "",
    total_copies: "",
    location: "",
    pages: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pre-populate form with book data
  useEffect(() => {
    setFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      publication_year: book.publication_year?.toString() || "",
      genre: book.genre || "",
      description: book.description || "",
      total_copies: book.total_copies?.toString() || "",
      location: book.location || "",
      pages: book.pages?.toString() || "",
    });
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.author.trim()) {
      setError("Author is required");
      return;
    }
    if (!formData.genre) {
      setError("Category is required");
      return;
    }
    if (!formData.total_copies || parseInt(formData.total_copies) < 1) {
      setError("Number of copies must be at least 1");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/books/${book.book_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            author: formData.author,
            isbn: formData.isbn || null,
            publisher: formData.publisher || null,
            publication_year: formData.publication_year
              ? parseInt(formData.publication_year)
              : null,
            genre: formData.genre,
            description: formData.description || null,
            total_copies: parseInt(formData.total_copies),
            location: formData.location || null,
            pages: formData.pages ? parseInt(formData.pages) : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update book");
      }

      const data = await response.json();
      setSuccess("Book updated successfully!");

      // Call onSave with updated book data
      setTimeout(() => {
        onSave(data.book);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error("Error updating book:", err);
      setError(err.message || "Failed to update book");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Science",
    "Technology",
    "History",
    "Biography",
    "Literature",
    "Reference",
    "Children's Books",
    "Other",
  ];

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader>
            <CardTitle className="edit-modal-title">
              <BookOpen className="book-icon" />
              Edit Book
            </CardTitle>
            <CardDescription>
              Update the details for "{book.title}"
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="edit-book-form">
              {/* Success Message */}
              {success && <div className="success-message">{success}</div>}

              {/* Error Message */}
              {error && <div className="error-message">{error}</div>}

              {/* Basic Information */}
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter book title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={formData.author}
                      onChange={(e) =>
                        handleInputChange("author", e.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="Enter ISBN"
                      value={formData.isbn}
                      onChange={(e) =>
                        handleInputChange("isbn", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="genre">Category *</Label>
                    <Select
                      value={formData.genre}
                      onValueChange={(value) =>
                        handleInputChange("genre", value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      placeholder="Enter publisher"
                      value={formData.publisher}
                      onChange={(e) =>
                        handleInputChange("publisher", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="publication_year">Publication Year</Label>
                    <Input
                      id="publication_year"
                      type="number"
                      placeholder="2024"
                      value={formData.publication_year}
                      onChange={(e) =>
                        handleInputChange("publication_year", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <Label htmlFor="pages">Number of Pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      placeholder="Enter page count"
                      value={formData.pages}
                      onChange={(e) =>
                        handleInputChange("pages", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter book description..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <Label htmlFor="total_copies">Number of Copies *</Label>
                    <Input
                      id="total_copies"
                      type="number"
                      placeholder="1"
                      min="1"
                      value={formData.total_copies}
                      onChange={(e) =>
                        handleInputChange("total_copies", e.target.value)
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="location">Shelf Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., A-15, B-23"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Button row */}
              <div className="button-row">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
