import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BookOpen, Upload } from "lucide-react";

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
    location: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Book added successfully! (Demo mode)");
    setFormData({
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publishYear: "",
      category: "",
      description: "",
      copies: "",
      location: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    "Other"
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
            <CardDescription>Fill in the details for the new book</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="book-form">
              {/* Basic Information */}
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter book title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      required
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
                      onChange={(e) => handleInputChange('isbn', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
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
                      onChange={(e) => handleInputChange('publisher', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="publishYear">Publication Year</Label>
                    <Input
                      id="publishYear"
                      type="number"
                      placeholder="2024"
                      value={formData.publishYear}
                      onChange={(e) => handleInputChange('publishYear', e.target.value)}
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
                    onChange={(e) => handleInputChange('description', e.target.value)}
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
                      onChange={(e) => handleInputChange('copies', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="location">Shelf Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., A-15, B-23"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Book Cover Upload */}
              <div className="upload-section">
                <Label>Book Cover (Optional)</Label>
                <div className="upload-box">
                  <Upload className="upload-icon" />
                  <p>Click to upload book cover</p>
                  <p className="upload-note">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="button-row">
                <Button type="submit">Add Book</Button>
                <Button type="button" variant="outline">
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
