'use client';
import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, usePathname } from 'next/navigation';

const DraftEditor = dynamic(
  () => import('./DraftEditor'),
  { ssr: false }
);

// Create a client component for the template editor
function TemplateEditor() {
  const [template, setTemplate] = useState({
    mainImageUrl: '',
    landingPageUrl: '',
    previewText: '',
    emailBody: '',
    termsContent: ''
  });
  const [htmlContent, setHtmlContent] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const templateType = searchParams.get('template') || 'offer';
    
    fetch(`/api/template?template=${templateType}`)
      .then(response => response.json())
      .then(data => {
        const templateData = parseTemplate(data.content);
        setTemplate(templateData);
        setHtmlContent(data.content);
      })
      .catch(error => console.error('Error loading template:', error));
  }, [searchParams, pathname]);

  const parseTemplate = useCallback((content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Extract email body between comment markers
    const emailBodyMatch = content.match(/<!-- Email Copy -->([\s\S]*?)<!-- End Email Copy -->/);
    const emailBody = emailBodyMatch ? emailBodyMatch[1].trim() : '';

    // Extract terms between comment markers
    const termsMatch = content.match(/<!-- Terms -->([\s\S]*?)<!-- End Terms -->/);
    const terms = termsMatch ? termsMatch[1].trim() : '';

    return {
      mainImageUrl: doc.querySelector('.targetImage')?.getAttribute('src') || '',
      landingPageUrl: doc.querySelector('.targetLink')?.getAttribute('href') || '',
      previewText: doc.querySelector('.targetPreview')?.textContent?.trim() || '',
      emailBody: emailBody,
      termsContent: terms
    };
  }, []);

  const updateTemplate = useCallback((field, value) => {
    setTemplate(prev => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
    
    setHtmlContent(prevContent => {
      let newContent = prevContent;
      
      switch(field) {
        case 'mainImageUrl':
          newContent = newContent.replace(
            /(<!-- Main Image -->[\s\S]*?<img[^>]*src=")[^"]*(")/g,
            `$1${value}$2`
          );
          break;
        case 'landingPageUrl':
          newContent = newContent.replace(
            /(<!-- Landing Page URL -->\s*<a[^>]*href=")[^"]*(")/g,
            `$1${value}$2`
          );
          break;
        case 'previewText':
          newContent = newContent.replace(
            /(<!-- Preview Text -->[\s\S]*?<p[^>]*>)(.*?)(<\/p>)/,
            `$1${value}$3`
          );
          break;
        case 'emailBody':
          if (!value.includes('<!-- Email Copy -->')) {
            newContent = newContent.replace(
              /(<!-- Email Copy -->)([\s\S]*?)(<!-- End Email Copy -->)/,
              `$1\n${value}\n$3`
            );
          }
          break;
        case 'termsContent':
          if (!value.includes('<!-- Terms -->')) {
            newContent = newContent.replace(
              /(<!-- Terms -->)([\s\S]*?)(<!-- End Terms -->)/,
              `$1\n${value}\n$3`
            );
          }
          break;
      }
      
      return newContent !== prevContent ? newContent : prevContent;
    });
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      console.error('Copy failed:', err);
    }
  };

  return (
    <main className="flex h-[calc(100vh-100px)]">
      <div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview Text
          </label>
          <input
            type="text"
            value={template.previewText}
            onChange={(e) => updateTemplate('previewText', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={template.mainImageUrl}
            onChange={(e) => updateTemplate('mainImageUrl', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Landing Page URL
          </label>
          <input
            type="text"
            value={template.landingPageUrl}
            onChange={(e) => updateTemplate('landingPageUrl', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>
          <DraftEditor
            content={template.emailBody}
            onChange={(html) => updateTemplate('emailBody', html)}
            defaultFontSize="18"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Terms & Conditions
          </label>
          <DraftEditor
            content={template.termsContent}
            onChange={(html) => updateTemplate('termsContent', html)}
            defaultFontSize="12"
          />
        </div>
      </div>

      <div className="w-1/2 flex flex-col">
        <div className="flex-1 bg-white">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { margin: 0; padding: 0; }
                  </style>
                </head>
                <body>
                  ${htmlContent}
                </body>
              </html>
            `}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>

        <div className="h-48 p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">HTML Output</span>
            <div className="flex items-center gap-2">
              {copySuccess && (
                <span className="text-sm text-green-600">{copySuccess}</span>
              )}
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Copy HTML
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={htmlContent}
            className="w-full h-32 p-2 border rounded-md font-mono text-sm bg-white"
            style={{ resize: 'none' }}
          />
        </div>
      </div>
      <Analytics />
    </main>
  );
}

// Main component with Suspense boundary
export default function EmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplateEditor />
    </Suspense>
  );
}