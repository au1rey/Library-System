import { useState, useRef } from "react";
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
// New API method
import { api } from "../../services/api";

export function AddBook() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishYear: "",
    category: "",
    description: "",
    copies: "",
    location: "",
    pages: "",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // validation logic
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

  // NEW: Drag and drop handlers
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
  // Remove selected image
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
    setLoading(true);

    try {
      // Real API integration
      await api.addBookWithImage(formData, coverImage);

      // Success feedback
      setSuccess("Book added successfully!");

      // Clear form
      setFormData({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        publishYear: "",
        category: "",
        description: "",
        copies: "",
        location: "",
        pages: "",
      });
    } catch (err) {
      // Error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add book. Please try again.");
      }
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
    <div className="add-book-container">
      {/* Header */}
      <div className="add-book-header">
        <h1>Add New Book</h1>
        <p>Add a new book to the library catalog</p>
      </div>

      <div className="add-book-card-wrapper">
        <Card>
          <CardHeader>
            <CardTitle className="book-info-title">
              <BookOpen className="book-icon" />
              Book Information
            </CardTitle>
            <CardDescription>
              Fill in the details for the new book
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="book-form">
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
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
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
                    <Label htmlFor="publishYear">Publication Year</Label>
                    <Input
                      id="publishYear"
                      type="number"
                      placeholder="2024"
                      value={formData.publishYear}
                      onChange={(e) =>
                        handleInputChange("publishYear", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* New Pages Field */}
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
                    <Label htmlFor="copies">Number of Copies *</Label>
                    <Input
                      id="copies"
                      type="number"
                      placeholder="1"
                      min="1"
                      value={formData.copies}
                      onChange={(e) =>
                        handleInputChange("copies", e.target.value)
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

              {/* Book Cover Upload */}
              <div className="upload-section">
                <Label>Book Cover (Optional)</Label>
                {imagePreview ? (
                  // Show preview when image is selected
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="remove-image-btn"
                      disabled={loading}
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                ) : (
                  // Show upload box when no image
                  <div
                    className={`upload-box ${isDragging ? "dragging" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="upload-icon" />
                    <p>Click to upload book cover</p>
                    <p className="upload-note">PNG, JPG up to 5MB</p>
                  </div>
                )}
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

              {/* Submit Button */}
              <div className="button-row">
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding Book..." : "Add Book"}
                </Button>
                <Button type="button" variant="outline" disabled={loading}>
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
