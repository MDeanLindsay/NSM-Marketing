'use client';
import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function EmailPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [emailCopyContent, setEmailCopyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [activeButton, setActiveButton] = useState('NR');


  // Helper function to convert HTML to plain text
  const htmlToPlainText = (html) => {
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
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

        // Extract current landing page URL
        const linkMatch = data.content.match(/<!-- Landing Page URL -->\s*<a[^>]*href="([^"]*)"/);
        if (linkMatch && linkMatch[1]) {
          setLandingPageUrl(linkMatch[1]);
        }

        // Extract preview text
        const previewMatch = data.content.match(/<!-- Preview Text -->[\s\S]*?<p[^>]*>(.*?)<\/p>/);
        if (previewMatch && previewMatch[1]) {
          setPreviewText(htmlToPlainText(previewMatch[1]));
        }

        // Extract email copy content
        const copyMatch = data.content.match(/<!-- Email Copy -->[\s\S]*?(<p>.*?<\/p>\s*<p>.*?<\/p>\s*<p>.*?<\/p>)/s);
        if (copyMatch && copyMatch[1]) {
          setEmailCopyContent(htmlToPlainText(copyMatch[1]));
        }

        // Extract terms content
        const termsMatch = data.content.match(/<!-- Terms -->[\s\S]*?<p[^>]*>(.*?)<\/p>/s);
        if (termsMatch && termsMatch[1]) {
          setTermsContent(htmlToPlainText(termsMatch[1]));
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

  const updateLandingPage = () => {
    const newContent = htmlContent.replace(
      /(<!-- Landing Page URL -->\s*<a[^>]*href=")[^"]*(")/g,
      `$1${landingPageUrl}$2`
    );
    setHtmlContent(newContent);
  };

  const updatePreviewText = () => {
    const htmlPreview = plainTextToHtml(previewText);
    const newContent = htmlContent.replace(
      /(<!-- Preview Text -->[\s\S]*?<p[^>]*>)(.*?)(<\/p>)/,
      `$1${previewText}$3`
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

  const updateTerms = () => {
    const htmlTerms = plainTextToHtml(termsContent);
    const newContent = htmlContent.replace(
      /(<!-- Terms -->[\s\S]*?<p[^>]*>)(.*?)(<\/p>)/s,
      `$1${htmlTerms.replace(/<\/?p>/g, '')}$3`
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
        <Image
          src="/images/nsm.png"
          alt="NSM Logo"
          width={192}
          height={192}
          className="mx-auto"
          priority
        />
        {/* Mode Toggle Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            className={`px-6 py-2 rounded-md font-medium ${activeButton === 'NR'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white'
              } transition-colors duration-200`}
            onClick={() => setActiveButton('NR')}
          >
            NR
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium ${activeButton === 'WFE'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white'
              } transition-colors duration-200`}
            onClick={() => setActiveButton('WFE')}
          >
            WFE
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium ${activeButton === 'SSE'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white'
              } transition-colors duration-200`}
            onClick={() => setActiveButton('SSE')}
          >
            SSE
          </button>
        </div>
        {/* Image URL Input */}
        <div className="mb-6">
          <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image URL
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
              Update
            </button>
          </div>
        </div>

        {/* Landing Page URL Input */}
        <div className="mb-6">
          <label htmlFor="landingPage" className="block text-sm font-medium text-gray-700 mb-2">
            Landing Page URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="landingPage"
              value={landingPageUrl}
              onChange={(e) => setLandingPageUrl(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Enter landing page URL"
            />
            <button
              onClick={updateLandingPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </div>

        {/* Preview Text Input */}
        <div className="mb-6">
          <label htmlFor="previewText" className="block text-sm font-medium text-gray-700 mb-2">
            Preview Text
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="previewText"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Enter preview text"
            />
            <button
              onClick={updatePreviewText}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </div>

        {/* Email Copy Editor */}
        <div className="mb-6">
          <label htmlFor="emailCopy" className="block text-sm font-medium text-gray-700 mb-2">
            Email Copy Content
          </label>
          <div className="flex flex-col gap-2">
            <textarea
              id="emailCopy"
              value={emailCopyContent}
              onChange={(e) => setEmailCopyContent(e.target.value)}
              className="w-full p-2 border rounded-md font-sans text-sm whitespace-pre-wrap"
              rows={5}
              placeholder="Enter email copy content"
            />
            <button
              onClick={updateEmailCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-fit"
            >
              Update
            </button>
          </div>
        </div>

        {/* Terms & Conditions Editor */}
        <div className="mb-6">
          <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-2">
            Terms & Conditions
          </label>
          <div className="flex flex-col gap-2">
            <textarea
              id="terms"
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              className="w-full p-2 border rounded-md font-sans text-sm whitespace-pre-wrap"
              rows={3}
              placeholder="Enter terms and conditions"
            />
            <button
              onClick={updateTerms}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-fit"
            >
              Update
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
      <Analytics />
    </main>
  );
}