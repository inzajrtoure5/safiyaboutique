'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import des styles CSS de Quill
if (typeof window !== 'undefined') {
  require('react-quill/dist/quill.snow.css');
}

// Import dynamique de React Quill
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B7355]"></div>
      <p className="luxury-text text-sm text-[#8B6F47] mt-4">Chargement de l'éditeur...</p>
    </div>
  )
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B7355]"></div>
        <p className="luxury-text text-sm text-[#8B6F47] mt-4">Chargement...</p>
      </div>
    );
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'align',
    'link', 'image', 'blockquote', 'code-block'
  ];

  return (
    <div className="quill-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        style={{ 
          backgroundColor: 'white',
          minHeight: '400px',
          marginBottom: '50px'
        }}
        className="bg-white rounded-lg"
      />
      <style jsx global>{`
        .quill-editor-wrapper .ql-container {
          font-family: var(--font-cormorant), serif;
          font-size: 16px;
          min-height: 300px;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 300px;
          padding: 20px;
          font-family: var(--font-cormorant), serif;
          line-height: 1.6;
          color: #3D2817;
        }
        .quill-editor-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-bottom: 1px solid #E8E0D5;
          background-color: #FAF7F0;
        }
        .quill-editor-wrapper .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border: 1px solid #E8E0D5;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #8B6F47;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
