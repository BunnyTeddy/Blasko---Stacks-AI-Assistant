'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Response } from '@/components/ai-elements/response';

type StacksKnowledgeProps = {
  question: string;
  answer?: string;
  rawContent: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
};

export function StacksKnowledge({ question, answer, rawContent, sources }: StacksKnowledgeProps) {
  // Extract a clean summary from rawContent if no answer provided
  const displayContent = answer || extractSummary(rawContent);
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold">{question}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Answer Section */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Response>{displayContent}</Response>
        </div>
        
        {/* Sources Section */}
        {sources.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              📚 Sources:
            </p>
            <div className="space-y-1.5">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 hover:underline group transition-colors"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                  <span className="line-clamp-1">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to extract a readable summary from raw documentation content
function extractSummary(rawContent: string): string {
  // Remove the instruction part if present
  let content = rawContent.replace(/---\s*INSTRUCTION:.*$/s, '').trim();
  content = content.replace(/^DOCUMENTATION CONTENT FOR.*?:\s*/s, '').trim();
  
  // Take first few paragraphs (limit to ~800 chars for readability)
  const paragraphs = content.split('\n\n');
  let summary = '';
  
  for (const para of paragraphs) {
    if (summary.length + para.length < 800) {
      summary += para + '\n\n';
    } else {
      break;
    }
  }
  
  return summary.trim() || 'Information found in documentation. Please check the sources below.';
}

