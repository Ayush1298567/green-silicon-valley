"use client";

// Placeholder for future drag-and-drop page layout editor
// This component would allow visual page building with draggable components

interface Props {
  pageId: string;
  layoutConfig: any;
  onChange: (config: any) => void;
}

export default function PageEditorPanel({ pageId, layoutConfig, onChange }: Props) {
  return (
    <div className="p-8">
      <div className="text-center text-gray-500">
        <p className="text-lg font-medium">Advanced Page Layout Editor</p>
        <p className="text-sm mt-2">Coming soon: Drag-and-drop page builder</p>
        <p className="text-xs mt-4">For now, use Content Blocks to manage page content</p>
      </div>
    </div>
  );
}

