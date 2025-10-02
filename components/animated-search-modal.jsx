"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search, Upload, Paperclip } from "lucide-react"

export default function AnimatedSearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("cve")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="w-[90%] max-w-2xl h-[70vh] bg-card border-primary/50 shadow-2xl animate-in zoom-in-95 duration-300"
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
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="search-input" className="text-foreground">
                Search Query
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Enter CVE ID, device name, or threat indicator..."
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
                  <SelectItem value="device">Search Device</SelectItem>
                  <SelectItem value="ioc">Search IOC</SelectItem>
                  <SelectItem value="threat">Search Threat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Attach Dependency File (Optional)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  {showFileUpload ? "Hide" : "Attach"}
                </Button>
              </div>

              {showFileUpload && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 bg-secondary/20 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground mb-1">Upload project dependency file</p>
                      <p className="text-xs text-muted-foreground">package.json, requirements.txt, pom.xml, etc.</p>
                    </div>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      className="max-w-xs cursor-pointer"
                      accept=".json,.txt,.xml,.lock,.yaml,.yml"
                    />
                    {uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Paperclip className="h-4 w-4" />
                        <span>{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onClose}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
