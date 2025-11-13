"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
};

export default function SimpleEditor({ name, defaultValue = "" }: Props) {
  const [value, setValue] = useState<string>(defaultValue);
  const [preview, setPreview] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function wrap(prefix: string, suffix = prefix) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const next = `${before}${prefix}${selected}${suffix}${after}`;
    setValue(next);
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2 text-sm">
        <button type="button" className="border rounded px-2 py-1" onClick={() => wrap("**")}>Bold</button>
        <button type="button" className="border rounded px-2 py-1" onClick={() => wrap("_")}>Italic</button>
        <button type="button" className="border rounded px-2 py-1" onClick={() => wrap("[", "](https://)")}>Link</button>
        <button type="button" className="border rounded px-2 py-1" onClick={() => setPreview(!preview)}>{preview ? "Edit" : "Preview"}</button>
      </div>
      {!preview ? (
        <textarea
          ref={textareaRef}
          className="border rounded px-3 py-2 min-h-[160px]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div className="border rounded px-3 py-2 min-h-[160px] whitespace-pre-wrap text-gsv-charcoal bg-white">{value}</div>
      )}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}


