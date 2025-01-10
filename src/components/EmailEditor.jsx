'use client';
import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DraftEditor = dynamic(
  () => import('./DraftEditor'),
  { ssr: false }
);

export default function EmailPage() {
  const [template, setTemplate] = useState({
    mainImageUrl: '',
    landingPageUrl: '',
    previewText: '',
    emailBody: '',
    termsContent: ''
  });
  const [htmlContent, setHtmlContent] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetch('/api/template')
      .then(response => response.json())
      .then(data => {
        const content = data.content;
        
        // Extract initial values
        const imgMatch = content.match(/<!-- Main Image -->[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>/);
        const linkMatch = content.match(/<!-- Landing Page URL -->\s*<a[^>]*href="([^"]*)"/);
        const previewMatch = content.match(/<!-- Preview Text -->[\s\S]*?<p[^>]*>(.*?)<\/p>/);
        const emailBodyMatch = content.match(/<!-- Email Copy -->([\s\S]*?)<!-- End Email Copy -->/);
        const termsMatch = content.match(/<!-- Terms -->\s*<p[^>]*>([\s\S]*?)<\/p>\s*<!-- End Terms -->/);

        const initialTemplate = {
          mainImageUrl: imgMatch?.[1] || '',
          landingPageUrl: linkMatch?.[1] || '',
          previewText: previewMatch?.[1] || '',
          emailBody: emailBodyMatch?.[1]?.trim() || '',
          termsContent: termsMatch?.[1]?.trim() || ''
        };

        setTemplate(initialTemplate);
        setHtmlContent(content);
      })
      .catch(error => console.error('Error loading template:', error));
  }, []);

  const updateTemplate = (field, value) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
    
    setHtmlContent(prevContent => {
      let newContent = prevContent;
      
      switch(field) {
        case 'mainImageUrl':
          newContent = newContent.replace(
            /(<!-- Main Image -->[\s\S]*?<img[^>]*src=")[^"]*(")/,
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
          newContent = newContent.replace(
            /(<!-- Email Copy -->)([\s\S]*?)(<!-- End Email Copy -->)/,
            `$1\n${value}\n$3`
          );
          break;
          case 'termsContent':
            newContent = newContent.replace(
              /(<!-- Terms -->\s*<p[^>]*>)([\s\S]*?)(<\/p>\s*<!-- End Terms -->)/,
              `$1${value}$3`
            );
            break;
      }
      
      return newContent;
    });
  };

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
      {/* Left side controls */}
      <div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
        {/* Preview Text */}
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

        {/* Image URL Input */}
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

        {/* Landing Page URL */}
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

        {/* Email Body Editor */}
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

        {/* Terms & Conditions */}
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

      {/* Right side - Preview and HTML Output */}
      <div className="w-1/2 flex flex-col">
        {/* Preview Section */}
        <div className="flex-1 bg-white">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
        
        {/* HTML Output Section */}
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