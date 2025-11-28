import React, { useMemo } from 'react';

interface CodeRunnerProps {
  code: string;
  height?: number;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({ code, height = 300 }) => {
  // We wrap the user code in a basic HTML structure to ensure it renders correctly.
  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 1rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${code}
          <script>
            // Error catching to display inside the iframe
            window.onerror = function(message, source, lineno, colno, error) {
              document.body.innerHTML += '<div style="color:red; background:#fee; padding:8px; border-radius:4px; margin-top:8px; font-family:monospace;">Runtime Error: ' + message + '</div>';
            };
          </script>
        </body>
      </html>
    `;
  }, [code]);

  return (
    <div 
      className="w-full rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
      style={{ height: `${height}px` }}
    >
      <iframe
        title="Code Preview"
        srcDoc={srcDoc}
        className="w-full h-full border-none"
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default CodeRunner;