"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Quote,
  Eye,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = ""
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-gray-100 text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 mr-4">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={addImage}
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <ToolbarButton
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            isActive={isPreviewMode}
            title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
          >
            <Eye className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className={isPreviewMode ? 'pointer-events-none' : ''}>
        <EditorContent editor={editor} />
      </div>

      {/* Preview Mode Indicator */}
      {isPreviewMode && (
        <div className="bg-blue-50 border-t border-blue-200 p-2 text-center text-sm text-blue-700">
          Preview Mode - Click the eye icon to return to editing
        </div>
      )}
    </div>
  );
}

// Helper function to extract plain text from HTML content
export function htmlToText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Helper function to validate HTML content
export function validateHtmlContent(html: string): boolean {
  // Basic validation - check for balanced tags
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerHTML === html;
}
