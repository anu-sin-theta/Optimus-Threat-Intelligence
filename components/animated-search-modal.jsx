"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search, Upload, Paperclip, Loader2 } from "lucide-react"
import SearchResultItem from "./search-result-item"

export default function AnimatedSearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("cve")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults(null);
    try {
      const source = searchType === 'cve' ? 'nvd' : searchType;
      const response = await fetch(`/api/search/${source}?query=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data.data);
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="w-[90%] max-w-2xl h-[70vh] bg-card border-primary/50 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="flex flex-col h-full p-6 relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Advanced Search</h2>
            <p className="text-sm text-muted-foreground">What's your Query?</p>
          </div>

          {/* Search Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-input" className="text-foreground">
                Search Query
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder={searchType === 'cve' ? 'e.g., CVE-2021-44228' : searchType === 'ioc' ? 'e.g., 1.1.1.1 or example.com' : 'e.g., Log4j or APT29'}
                  className="pl-10 h-12 text-base bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Search Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="search-type" className="text-foreground">
                Search Type
              </Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger id="search-type" className="h-12 bg-background">
                  <SelectValue placeholder="Select search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cve">Search CVE</SelectItem>
                  <SelectItem value="ioc">Search IOC</SelectItem>
                  <SelectItem value="threat">Search Threat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-grow mt-6 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults && (
              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <SearchResultItem key={index} result={result} />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No results found.</div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
