import { useEffect, useRef } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EasyMDE | null>(null);

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = new EasyMDE({
        element: textareaRef.current,
        initialValue: value,
        spellChecker: false,
        status: false,
      });

      editorRef.current.codemirror.on('change', () => {
        onChange(editorRef.current!.value());
      });
    }
    return () => {
        if(editorRef.current) {
            editorRef.current.toTextArea();
            editorRef.current = null;
        }
    }
  }, []);

  // Update value if changed from outside
  useEffect(() => {
    if (editorRef.current && editorRef.current.value() !== value) {
      editorRef.current.value(value);
    }
  }, [value]);

  return <textarea ref={textareaRef} />;
}
