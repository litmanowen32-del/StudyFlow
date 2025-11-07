import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Lightbulb, Sparkles, Camera, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

const StudyAssistant = () => {
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim() && !imageFile) {
      toast({
        title: "Error",
        description: "Please enter a topic or upload an assignment image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExplanation("");

    try {
      let imageBase64 = "";
      if (imageFile) {
        imageBase64 = await convertImageToBase64(imageFile);
      }

      const { data, error } = await supabase.functions.invoke('study-assistant', {
        body: { 
          topic: topic.trim(),
          image: imageBase64
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      <div className="mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Learning</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Study Assistant
        </h1>
        <p className="text-lg text-muted-foreground">
          Get instant explanations and study tips for any topic powered by AI
        </p>
      </div>

      <Card className="mb-8 shadow-soft border-border/50 animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            What would you like to learn?
          </CardTitle>
          <CardDescription className="text-base">
            Enter a topic or upload a photo of your assignment for AI-powered teaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Question</Label>
                <Input
                  id="topic"
                  type="text"
                  placeholder="e.g., Help me solve this math problem..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Assignment Photo</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Image
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {imagePreview && (
                <div className="relative rounded-lg border border-border overflow-hidden animate-fade-in">
                  <img 
                    src={imagePreview} 
                    alt="Assignment preview" 
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || (!topic.trim() && !imageFile)}
              size="lg"
              className="w-full bg-gradient-primary shadow-glow hover:shadow-accent-glow transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Assignment...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Teaching Assistance
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {explanation && (
        <Card className="shadow-soft border-border/50 animate-fade-in">
          <CardHeader className="border-b bg-gradient-card">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Explanation & Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground">
              {explanation.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 leading-relaxed text-base">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!explanation && !isLoading && (
        <Card className="border-dashed border-2 animate-fade-in">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg">
              Your AI-powered explanation will appear here
            </p>
            <p className="text-muted-foreground/70 text-sm mt-2">
              Enter a topic above to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyAssistant;
