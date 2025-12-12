import { useState } from "react";
import { Search, ExternalLink, Shield, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  title: string;
  url: string;
  description: string;
  trustReason: string;
}

const ResearchFinder = () => {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "No topic provided",
        description: "Please enter a research topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setArticles([]);

    try {
      const { data, error } = await supabase.functions.invoke("research-articles", {
        body: { query },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.articles && data.articles.length > 0) {
        setArticles(data.articles);
        toast({ title: "Articles found!" });
      } else if (data?.rawContent) {
        toast({
          title: "Results found",
          description: "Could not parse structured results, showing raw response",
        });
      } else {
        toast({
          title: "No articles found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Error finding articles",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Search className="h-4 w-4" />
          <span>AI-Powered</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Research Finder
        </h1>
        <p className="text-lg text-muted-foreground">
          Enter a topic and get a curated list of trustworthy articles and sources
        </p>
      </div>

      <Card className="p-6 shadow-soft mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="Enter a research topic (e.g., climate change, artificial intelligence, history of Rome)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Articles
              </>
            )}
          </Button>
        </div>
      </Card>

      {articles.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground">
            Found {articles.length} trustworthy sources
          </h2>
          {articles.map((article, index) => (
            <Card key={index} className="p-5 shadow-soft hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary hover:underline inline-flex items-center gap-2"
                  >
                    {article.title}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-muted-foreground mt-2">{article.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span>{article.trustReason}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && query && (
        <div className="text-center text-muted-foreground py-12">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter a topic and click "Find Articles" to discover trustworthy sources</p>
        </div>
      )}
    </div>
  );
};

export default ResearchFinder;
