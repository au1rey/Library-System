import { useState, useEffect, useRef } from "react";
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
import { BookOpen, Upload, X } from "lucide-react";
import type { BookWithCopies } from "../../../backend/models/BooksWithCopies";
import { api } from "../../services/api";
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

  //image state
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pre-populate form with book data
  useEffect(() => {
    if (book) {
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
      if (book.cover_url) {
        setCurrentCoverUrl(book.cover_url);
      }
    }
  }, [book]);

  // Validation logic for file
  const validateAndSetFile = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPG/PNG images are allowed");
      setCoverImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      setCoverImage(null);
      setImagePreview(null);
      return;
    }

    // Clear any previous errors
    setError("");
    setCoverImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  //  Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // : Remove selected image
  const handleRemoveImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      // Use new API method with multipart support
      const updatedBook = await api.updateBookWithImage(
        book.book_id,
        {
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn || undefined,
          publisher: formData.publisher || undefined,
          publishYear: formData.publication_year || undefined,
          category: formData.genre,
          description: formData.description || undefined,
          copies: formData.total_copies,
          location: formData.location || undefined,
          pages: formData.pages || undefined,
        },
        coverImage
      );

      setSuccess("Book updated successfully!");

      // Call onSave with updated book data
      setTimeout(() => {
        onSave(updatedBook);
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
  // Determine what to show for cover image area
  const resolvedCurrentCover = currentCoverUrl
    ? `http://localhost:3000${currentCoverUrl}`
    : null;

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
                      key={`genre-${book.book_id}`}
                      value={formData.genre}
                      onValueChange={(value) =>
                        handleInputChange("genre", value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger id="genre">
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
              {/* Book Cover Upload Section */}
              <div className="upload-section">
                <Label>Change Cover (Optional)</Label>

                <div className="upload-flex-container">
                  {(imagePreview || resolvedCurrentCover) && (
                    <div className="image-preview-container">
                      <img
                        src={imagePreview || resolvedCurrentCover!}
                        alt="Cover preview"
                        className="image-preview"
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="remove-image-btn"
                          disabled={loading}
                        >
                          <X size={16} />
                          Remove
                        </button>
                      )}
                    </div>
                  )}

                  {/* Right: Upload Box */}
                  <div
                    className={`upload-box ${isDragging ? "dragging" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="upload-icon" />
                    <p>Click or drag to upload a new cover</p>
                    <p className="upload-note">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={loading}
                />
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
