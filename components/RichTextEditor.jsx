"use client";

import { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Only update if it's external (initial load), prevent jumping cursor
      if (document.activeElement !== editorRef.current) {
         editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button type="button" onClick={() => execCommand('bold')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors font-bold">B</button>
        <button type="button" onClick={() => execCommand('italic')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors italic">I</button>
        <button type="button" onClick={() => execCommand('underline')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors underline">U</button>
        <div className="w-px bg-gray-300 mx-1 my-1"></div>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors font-medium text-sm">1.</button>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition-colors font-medium text-lg">•</button>
      </div>
      
      {/* Editable Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[200px] p-4 outline-none leading-relaxed text-gray-700 prose max-w-none"
        data-placeholder={placeholder}
      />
      <style dangerouslySetInnerHTML={{__html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block; /* For Firefox */
        }
      `}} />
    </div>
  );
}
