'use client';
import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect } from 'react';

export default function EmailPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [emailCopyContent, setEmailCopyContent] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // Helper function to convert HTML to plain text
  const htmlToPlainText = (html) => {
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  };

  // Helper function to convert plain text back to HTML
  const plainTextToHtml = (text) => {
    return text
      .split('\n')  // split on line breaks
      .filter(line => line.trim() !== '')  // remove empty lines
      .map(line => `<p>${line.trim()}</p>`)  // wrap each line in p tags
      .join('\n');  // join with line breaks
  };

  useEffect(() => {
    // Load the template content
    fetch('/api/template')
      .then(response => response.json())
      .then(data => {
        setHtmlContent(data.content);
        // Extract current image URL using regex
        const imgMatch = data.content.match(/<!-- Main Image -->[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>/);
        if (imgMatch && imgMatch[1]) {
          setMainImageUrl(imgMatch[1]);
        }

        // Extract email copy content
        const copyMatch = data.content.match(/<!-- Email Copy -->[\s\S]*?(<p>.*?<\/p>\s*<p>.*?<\/p>\s*<p>.*?<\/p>)/s);
        if (copyMatch && copyMatch[1]) {
          setEmailCopyContent(htmlToPlainText(copyMatch[1]));
        }
      });
  }, []);

  const updateMainImage = () => {
    const newContent = htmlContent.replace(
      /(<!-- Main Image -->[\s\S]*?<img[^>]*src=")[^"]*(")/,
      `$1${mainImageUrl}$2`
    );
    setHtmlContent(newContent);
  };

  const updateEmailCopy = () => {
    const htmlCopy = plainTextToHtml(emailCopyContent);
    const newContent = htmlContent.replace(
      /(<!-- Email Copy -->[\s\S]*?)(<p>.*?<\/p>\s*<p>.*?<\/p>\s*<p>.*?<\/p>)/s,
      `$1${htmlCopy}`
    );
    setHtmlContent(newContent);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Left side controls */}
      <div className="w-1/2 p-4 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Email Editor</h1>
        
        {/* Image URL Input */}
        <div className="mb-6">
          <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-2">
            Main Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="mainImage"
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Enter image URL"
            />
            <button
              onClick={updateMainImage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update Image
            </button>
          </div>
        </div>

        {/* Email Copy Editor */}
        <div className="mb-6">
          <label htmlFor="emailCopy" className="block text-sm font-medium text-gray-700 mb-2">
            Email Copy Content
          </label>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600 italic">
              Enter each paragraph on its own line.
            </p>
            <textarea
              id="emailCopy"
              value={emailCopyContent}
              onChange={(e) => setEmailCopyContent(e.target.value)}
              className="w-full p-2 border rounded-md font-sans text-sm whitespace-pre-wrap"
              rows={10}
              placeholder="Enter email copy content"
            />
            <button
              onClick={updateEmailCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-fit"
            >
              Update Copy
            </button>
          </div>
        </div>
      </div>
      
           {/* Right side - Preview and HTML Output */}
           <div className="w-1/2 h-screen flex flex-col">
        {/* Preview Section - Top 75% */}
        <div className="h-4/5 bg-white border-b">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>

        {/* HTML Output Section - Bottom 25% */}
        <div className="h-1/5 p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              HTML Output
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">{copySuccess}</span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Copy HTML
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={htmlContent}
            className="w-full h-[calc(100%-2rem)] p-2 border rounded-md font-mono text-sm bg-white"
            style={{ resize: 'none' }}
          />
        </div>
      </div>
      <Analytics/>
    </main>
  );
}