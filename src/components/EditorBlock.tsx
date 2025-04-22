import React, { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

// Define minimal interfaces to avoid type conflicts
interface EditorBlockProps {
  data: any;
  onChange: (data: any) => void;
  holder: string;
  editorRef?: React.MutableRefObject<any>;
  readOnly?: boolean;
  dir?: 'rtl' | 'ltr';
}

const EditorBlock: React.FC<EditorBlockProps> = ({ 
  data, 
  onChange, 
  holder, 
  editorRef,
  readOnly = false,
  dir = 'ltr'
}) => {
  // Reference to store the editor instance
  const editorInstanceRef = useRef<any>(null);
  const initializedRef = useRef<boolean>(false);

  // Initialize editor
  useEffect(() => {
    // Skip if already initialized to prevent double initialization
    if (initializedRef.current) return;
    
    // Set a small delay to ensure DOM is fully rendered
    const initTimeout = setTimeout(async () => {
      try {
        // Check if container exists
        const editorContainer = document.getElementById(holder);
        if (!editorContainer) {
          console.warn(`Editor container #${holder} not found`);
          return;
        }

        // Pre-initialize the container to ensure it has height
        editorContainer.innerHTML = '<div class="editor-placeholder">Loading editor...</div>';
        editorContainer.style.minHeight = '300px';
        
        // Import modules
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const HeaderTool = (await import('@editorjs/header')).default;
        const ListTool = (await import('@editorjs/list')).default;
        const ParagraphTool = (await import('@editorjs/paragraph')).default;
        const ImageTool = (await import('@editorjs/image')).default;
        const TableTool = (await import('@editorjs/table')).default;
        const QuoteTool = (await import('@editorjs/quote')).default;
        const EmbedTool = (await import('@editorjs/embed')).default;

        // Function to upload images
        const uploadImageByFile = async (file: File): Promise<any> => {
          const token = Cookies.get('accessToken');
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            
            const result = await response.json();
            return {
              success: 1,
              file: {
                url: `${process.env.NEXT_PUBLIC_UPLOAD_BASE}${result.data.url}`,
              }
            };
          } catch (error) {
            console.error('Error uploading image:', error);
            return {
              success: 0,
              error: 'Upload failed'
            };
          }
        };

        // Clean up existing editor instance
        if (editorInstanceRef.current) {
          try {
            if (typeof editorInstanceRef.current.destroy === 'function') {
              editorInstanceRef.current.destroy();
            }
          } catch (err) {
            console.error('Error destroying editor:', err);
          }
          editorInstanceRef.current = null;
        }

        // Clear the placeholder
        editorContainer.innerHTML = '';
        
        // Create editor instance - using "as any" to bypass TypeScript errors
        const editor = new EditorJS({
          holder,
          data: Object.keys(data).length > 0 ? data : {
            time: Date.now(),
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: 'Start writing your content here...'
                }
              }
            ],
            version: '2.28.0'
          },
          onChange: async () => {
            try {
              const savedData = await editor.save();
              onChange(savedData);
            } catch (err) {
              console.error('Failed to save editor data:', err);
            }
          },
          autofocus: false, // Prevent autofocus to fix input focus issues
          readOnly,
          placeholder: 'Start writing or press "+" to add content',
          tools: {
            header: {
              class: HeaderTool,
              inlineToolbar: true,
              config: {
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              }
            } as any,
            paragraph: {
              class: ParagraphTool,
              inlineToolbar: true
            } as any,
            list: {
              class: ListTool,
              inlineToolbar: true
            } as any,
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile: uploadImageByFile
                }
              }
            } as any,
            table: {
              class: TableTool,
              inlineToolbar: true
            } as any,
            quote: {
              class: QuoteTool,
              inlineToolbar: true
            } as any,
            embed: {
              class: EmbedTool,
              config: {
                services: {
                  youtube: true,
                  vimeo: true
                }
              }
            } as any
          } as any,
          i18n: {
            direction: dir
          }
        });

        // Mark as initialized to prevent re-initialization
        initializedRef.current = true;

        // Save references
        editorInstanceRef.current = editor;
        if (editorRef) {
          editorRef.current = editor;
        }
        
        // Apply RTL if needed
        if (dir === 'rtl') {
          const editorElement = document.getElementById(holder);
          if (editorElement) {
            editorElement.dir = 'rtl';
            editorElement.style.textAlign = 'right';
          }
        }
        
        // Log success
        console.log(`EditorJS initialized successfully in ${holder}`);
      } catch (err) {
        console.error('Failed to initialize editor:', err);
      }
    }, 300); // Small delay to ensure DOM is ready
    
    return () => {
      clearTimeout(initTimeout);
      
      // Clean up on unmount
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        try {
          editorInstanceRef.current.destroy();
        } catch (err) {
          // Ignore errors during cleanup
        }
        editorInstanceRef.current = null;
      }
      
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [holder]); // Only re-run if holder changes

  // Effect to handle direction changes
  useEffect(() => {
    if (!initializedRef.current) return;
    
    // Apply RTL styling if needed
    const container = document.getElementById(holder);
    if (container) {
      if (dir === 'rtl') {
        container.setAttribute('dir', 'rtl');
        container.style.textAlign = 'right';
      } else {
        container.setAttribute('dir', 'ltr');
        container.style.textAlign = 'left';
      }
    }
  }, [dir, holder]);

  return (
      <div className="editor-wrapper">
          <div
              id={holder}
              className="border rounded-lg p-3"
              style={{ minHeight: '300px', backgroundColor: '#fff' }}
          />
          <style jsx global>
            {`
                /* Base editor styles */
                .codex-editor {
                min-height: 300px;
                position: relative;
                width: 100%;
                margin: 0;
                padding: 0;
                }
                
                .ce-block__content {
                max-width: 100% !important;
                margin: 0;
                padding: 0 40px; /* Add padding to make space for buttons on both sides */
                }
                
                .ce-toolbar__content {
                max-width: 100% !important;
                }
                
                /* Add space for the plus button */
                .ce-block {
                position: relative;
                }
                
                /* Position the plus button */
                .ce-toolbar__plus {
                position: absolute;
                right: 10px;
                }
                
                /* Position the settings button */
                .ce-toolbar__actions {
                position: absolute;
                left: 10px;
                }
                
                /* RTL adjustments */
                [dir="rtl"] .ce-block__content {
                text-align: right;
                }
                
                [dir="rtl"] .ce-toolbar__plus {
                left: 10px !important;
                }
                
                [dir="rtl"] .ce-toolbar__actions {
                right: 10px !important;
                }
                
                /* Header styles */
                h1.ce-header, .ce-header[data-level="1"] {
                font-size: 2em !important;
                font-weight: bold !important;
                margin: 0.67em 0 !important;
                }
                
                h2.ce-header, .ce-header[data-level="2"] {
                font-size: 1.5em !important;
                font-weight: bold !important;
                margin: 0.83em 0 !important;
                }
                
                h3.ce-header, .ce-header[data-level="3"] {
                font-size: 1.17em !important;
                font-weight: bold !important;
                margin: 1em 0 !important;
                }
                
                h4.ce-header, .ce-header[data-level="4"] {
                font-size: 1em !important;
                font-weight: bold !important;
                margin: 1.33em 0 !important;
                }
                
                h5.ce-header, .ce-header[data-level="5"] {
                font-size: 0.83em !important;
                font-weight: bold !important;
                margin: 1.67em 0 !important;
                }
                
                h6.ce-header, .ce-header[data-level="6"] {
                font-size: 0.67em !important;
                font-weight: bold !important;
                margin: 2.33em 0 !important;
                }
                
                /* Editor placeholder */
                .editor-placeholder {
                padding: 10px;
                color: #999;
                }
            `}
         </style>
      </div>
  );
};

export default EditorBlock;