"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, Newspaper, AlertTriangle, Globe } from "lucide-react"

export default function CyberNewsTab() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    articlesToday: 0,
    criticalAlerts: 0,
    sources: 0
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Process and format the news articles
        const formattedNews = data.articles.map(article => ({
          title: article.title,
          source: article.source.name,
          category: getCategoryFromTitle(article.title),
          time: getTimeAgo(new Date(article.publishedAt)),
          summary: article.description,
          url: article.url
        }));

        setNews(formattedNews);

        // Calculate stats
        const today = new Date();
        const todayArticles = data.articles.filter(article =>
          new Date(article.publishedAt).toDateString() === today.toDateString()
        );

        setStats({
          articlesToday: todayArticles.length,
          criticalAlerts: formattedNews.filter(n =>
            n.category === 'Critical' || n.category === 'Vulnerability'
          ).length,
          sources: new Set(data.articles.map(a => a.source.name)).size
        });

      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Helper function to determine category based on title keywords
  const getCategoryFromTitle = (title) => {
    const lowercase = title.toLowerCase();
    if (lowercase.includes('vulnerability') || lowercase.includes('zero-day')) return 'Vulnerability';
    if (lowercase.includes('ransomware')) return 'Ransomware';
    if (lowercase.includes('breach') || lowercase.includes('leak')) return 'Data Breach';
    if (lowercase.includes('cisa') || lowercase.includes('government')) return 'Government';
    if (lowercase.includes('critical') || lowercase.includes('urgent')) return 'Critical';
    return 'General';
  };

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  };

  if (error) {
    return (
      <Card className="bg-card border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Error loading news: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Latest Cybersecurity News</CardTitle>
          <CardDescription>Real-time threat intelligence and security news from trusted sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Newspaper className="h-6 w-6 animate-pulse mr-2" />
                <span>Loading news...</span>
              </div>
            ) : (
              news.map((article, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2 leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {article.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            variant={article.category === 'Critical' ? 'destructive' : 'outline'}
                          >
                            {article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{article.source}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {article.time}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Articles Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.articlesToday}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats.criticalAlerts}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">{stats.sources}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
