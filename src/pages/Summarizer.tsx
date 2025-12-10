import { useState } from "react";
import { FileText, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Summarizer = () => {
  const [articleText, setArticleText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!articleText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste an article or text to summarize",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSummary("");

    try {
      const { data, error } = await supabase.functions.invoke("summarize-article", {
        body: { articleText },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
      toast({ title: "Summary generated!" });
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Error generating summary",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({ title: "Summary copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setArticleText("");
    setSummary("");
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Article Summarizer
        </h1>
        <p className="text-lg text-muted-foreground">
          Paste any article or text and get an AI-generated summary instantly
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Article Text</h2>
          </div>
          <Textarea
            placeholder="Paste your article or text here..."
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleSummarize}
              disabled={isLoading || !articleText.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summarize
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </Card>

        {summary && (
          <Card className="p-6 shadow-soft animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Summary</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{summary}</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
