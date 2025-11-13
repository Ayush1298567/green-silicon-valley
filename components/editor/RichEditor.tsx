"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

type Props = {
  name: string;
  defaultValue?: string;
};

export default function RichEditor({ name, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: true }),
      Image
    ],
    content: defaultValue || "",
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && defaultValue) {
      editor.commands.setContent(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const setLink = useCallback(() => {
    const url = prompt("Enter URL");
    if (url && editor) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const clearLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const pickImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("folder", "body");
      const res = await fetch("/api/blog/cover/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      const u = data.publicUrl as string;
      editor?.chain().focus().setImage({ src: u, alt: f.name }).run();
    } catch (err) {
      // ignore in UI, optional to add toast
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded">
      <div className="flex flex-wrap gap-2 p-2 border-b bg-white">
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullets</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numbered</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={setLink}>Link</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={clearLink}>Unlink</button>
        <button type="button" className="border rounded px-2 py-1 text-sm" onClick={pickImage} disabled={busy}>{busy ? "Uploading..." : "Image"}</button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
      <div className="p-2 bg-white">
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}


