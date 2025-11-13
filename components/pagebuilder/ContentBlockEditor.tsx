"use client";

import { useState, useEffect } from "react";
import { Type, Image as ImageIcon, Link as LinkIcon, Bold, Italic, List, Heading } from "lucide-react";

interface ContentBlock {
  id: number;
  key: string;
  title: string | null;
  content: string | null;
  html_content: string | null;
  page_section: string | null;
  display_order: number;
  is_published: boolean;
  css_classes: string | null;
}

interface Props {
  block: ContentBlock;
  editMode: "visual" | "code";
  onChange: (block: ContentBlock) => void;
  onSave: (block: Partial<ContentBlock>) => void;
}

export default function ContentBlockEditor({ block, editMode, onChange, onSave }: Props) {
  const [localContent, setLocalContent] = useState(block.html_content || block.content || "");
  const [localHtmlContent, setLocalHtmlContent] = useState(block.html_content || block.content || "");

  useEffect(() => {
    setLocalContent(block.content ?? "");
    setLocalHtmlContent(block.html_content ?? "");
  }, [block.content, block.html_content]);

  const handleContentChange = (value: string) => {
    setLocalContent(value);
    onChange({
      ...block,
      html_content: editMode === "code" ? value : block.html_content,
      content: editMode === "visual" ? value : block.content,
    });
  };

  const insertFormatting = (tag: string, placeholder: string = "text") => {
    const textarea = document.getElementById("visual-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end) || placeholder;
    
    let before = "";
    let after = "";
    let offset = 0;

    switch (tag) {
      case "h2":
        before = "## ";
        offset = 3;
        break;
      case "h3":
        before = "### ";
        offset = 4;
        break;
      case "bold":
        before = "**";
        after = "**";
        offset = 2;
        break;
      case "italic":
        before = "_";
        after = "_";
        offset = 1;
        break;
      case "link":
        before = "[";
        after = "](https://example.com)";
        offset = 1;
        break;
      case "ul":
        before = "- ";
        offset = 2;
        break;
      default:
        return;
    }

    const newContent = 
      localContent.substring(0, start) +
      before + selectedText + after +
      localContent.substring(end);

    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + offset, start + offset + selectedText.length);
    }, 0);
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Block Settings */}
      <div className="w-80 border-r bg-white p-6 overflow-y-auto">
        <h3 className="font-semibold mb-4">Block Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Block Key</label>
            <input
              type="text"
              value={block.key}
              onChange={(e) => onChange({ ...block, key: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
              placeholder="unique-key"
            />
            <p className="text-xs text-gray-500 mt-1">Used to reference this block in code</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={block.title || ""}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
              placeholder="Display title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Page Section</label>
            <input
              type="text"
              value={block.page_section || ""}
              onChange={(e) => onChange({ ...block, page_section: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
              placeholder="e.g., home-hero, about-mission"
            />
            <p className="text-xs text-gray-500 mt-1">Which page/section this appears on</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Order</label>
            <input
              type="number"
              value={block.display_order}
              onChange={(e) => onChange({ ...block, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CSS Classes</label>
            <input
              type="text"
              value={block.css_classes || ""}
              onChange={(e) => onChange({ ...block, css_classes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gsv-green"
              placeholder="text-center py-8"
            />
            <p className="text-xs text-gray-500 mt-1">Tailwind CSS classes</p>
          </div>

          <div className="pt-4 border-t">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.is_published}
                onChange={(e) => onChange({ ...block, is_published: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Published</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Only published blocks appear on the live site
            </p>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {editMode === "visual" && (
          <>
            {/* Visual Editor Toolbar */}
            <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
              <button
                onClick={() => insertFormatting("h2")}
                className="p-2 hover:bg-gray-100 rounded"
                title="Heading 2"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting("bold")}
                className="p-2 hover:bg-gray-100 rounded"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting("italic")}
                className="p-2 hover:bg-gray-100 rounded"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting("link")}
                className="p-2 hover:bg-gray-100 rounded"
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting("ul")}
                className="p-2 hover:bg-gray-100 rounded"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <div className="ml-auto text-xs text-gray-500">
                Supports Markdown formatting
              </div>
            </div>

            {/* Visual Text Area */}
            <div className="flex-1 overflow-auto">
              <textarea
                id="visual-editor"
                value={localContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full p-8 focus:outline-none resize-none font-mono text-sm"
                placeholder="Start typing your content... You can use Markdown formatting:

## Headings
**Bold text**
_Italic text_
[Link text](https://example.com)
- Bullet points
1. Numbered lists

Or just write plain text and format it later!"
              />
            </div>
          </>
        )}

        {editMode === "code" && (
          <>
            {/* Code Editor Help */}
            <div className="border-b bg-gray-50 px-4 py-2 text-xs text-gray-600">
              HTML/CSS editor - Advanced users only. Use Tailwind CSS classes for styling.
            </div>

            {/* Code Text Area */}
            <div className="flex-1 overflow-auto">
              <textarea
                value={localContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full p-8 focus:outline-none resize-none font-mono text-sm bg-gray-900 text-gray-100"
                placeholder="<div class='container py-10'>
  <h1 class='text-3xl font-bold'>Heading</h1>
  <p class='mt-4 text-gray-600'>Your content here...</p>
</div>"
              />
            </div>
          </>
        )}

        {/* Bottom Info Bar */}
        <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
          <div>{localContent.length} characters</div>
          <div>{editMode === "visual" ? "Visual Editor" : "Code Editor"}</div>
        </div>
      </div>
    </div>
  );
}

