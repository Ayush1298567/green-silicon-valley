"use client";

interface Props {
  content: string;
}

export default function PagePreview({ content }: Props) {
  // Simple markdown-to-HTML converter for preview
  const renderMarkdown = (text: string) => {
    let html = text;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');
    
    // Italic
    html = html.replace(/_(.*?)_/gim, '<em class="italic">$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-gsv-green hover:underline">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/gim, '<br />');
    
    return html;
  };

  // Check if content is HTML or markdown
  const isHTML = content.trim().startsWith('<');
  const renderedContent = isHTML ? content : renderMarkdown(content);

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Preview Mode</strong> - This is how your content will appear on the live site.
          </p>
        </div>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>
    </div>
  );
}

