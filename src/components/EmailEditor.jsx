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
    // Common fields
    previewText: '',
    previewTextHeader: '',
    emailBody: '',
    // Offer template fields
    mainBannerImage: '',
    mainBannerLink: '',
    termsContent: '',
    // WFE template fields
    headerBannerImage: '',
    headerBannerLink: '',
    subfeatures: [
      { image: '', link: '', line1: '', line2: '' },
      { image: '', link: '', line1: '', line2: '' },
      { image: '', link: '', line1: '', line2: '' }
    ],
    subBanners: [
      { image: '', link: '' },
      { image: '', link: '' },
      { image: '', link: '' }
    ]
  });
  const [htmlContent, setHtmlContent] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const templateType = searchParams.get('template') || 'offer';

  const parseTemplate = useCallback((content, templateType) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Extract email body between comment markers
    const emailBodyMatch = content.match(/<!-- Email Copy -->([\s\S]*?)<!-- End Email Copy -->/);
    const emailBody = emailBodyMatch ? emailBodyMatch[1].trim() : '';

    if (templateType === 'offer') {
      // Extract terms between comment markers
      const termsMatch = content.match(/<!-- Terms -->([\s\S]*?)<!-- End Terms -->/);
      const terms = termsMatch ? termsMatch[1].trim() : '';

      return {
        previewTextHeader: '',
        previewText: doc.querySelector('.targetPreview')?.textContent?.trim() || '',
        headerBannerImage: '',
        headerBannerLink: '',
        mainBannerImage: doc.querySelector('.targetImage')?.getAttribute('src') || '',
        mainBannerLink: doc.querySelector('.targetLink')?.getAttribute('href') || '',
        emailBody: emailBody || '',
        termsContent: terms || '',
        subfeatures: [
          { image: '', link: '', line1: '', line2: '' },
          { image: '', link: '', line1: '', line2: '' },
          { image: '', link: '', line1: '', line2: '' }
        ]
      };
    } else {
      // WFE template parsing
      return {
        previewTextHeader: doc.querySelector('.targetPreviewHeader')?.textContent?.trim() || '',
        previewText: doc.querySelector('.targetPreview')?.textContent?.trim() || '',
        headerBannerImage: doc.querySelector('.targetHeaderImage')?.getAttribute('src') || '',
        headerBannerLink: doc.querySelector('.targetHeaderLink')?.getAttribute('href') || '',
        mainBannerImage: doc.querySelector('.targetImage')?.getAttribute('src') || '',
        mainBannerLink: doc.querySelector('.targetLink')?.getAttribute('href') || '',
        emailBody: emailBody || '',
        termsContent: '',
        subfeatures: Array.from(doc.querySelectorAll('img.subfeature')).map((img, index) => {
          const container = img.closest('td');
          return {
            image: img.getAttribute('src') || '',
            link: container.querySelector('a')?.getAttribute('href') || '',
            line1: container.querySelector('.subfeature-line1')?.textContent?.trim() || '',
            line2: container.querySelector('.subfeature-line2')?.textContent?.trim() || ''
          };
        }).slice(0, 3),
        subBanners: [
          {
            image: doc.querySelector('.targetSubBannerImage1')?.getAttribute('src') || '',
            link: doc.querySelector('.targetSubBannerLink1')?.getAttribute('href') || ''
          },
          {
            image: doc.querySelector('.targetSubBannerImage2')?.getAttribute('src') || '',
            link: doc.querySelector('.targetSubBannerLink2')?.getAttribute('href') || ''
          },
          {
            image: doc.querySelector('.targetSubBannerImage3')?.getAttribute('src') || '',
            link: doc.querySelector('.targetSubBannerLink3')?.getAttribute('href') || ''
          }
        ]
      };
    }
  }, []);

  useEffect(() => {
    fetch(`/api/template?template=${templateType}`)
      .then(response => response.json())
      .then(data => {
        const templateData = parseTemplate(data.content, templateType);
        setTemplate(templateData);
        setHtmlContent(data.content);
      })
      .catch(error => console.error('Error loading template:', error));
  }, [templateType, parseTemplate]);

  const updateTemplate = useCallback((field, value, subfeatureIndex = null) => {
    setTemplate(prev => {
      if (subfeatureIndex !== null) {
        const newSubfeatures = [...prev.subfeatures];
        newSubfeatures[subfeatureIndex] = { ...newSubfeatures[subfeatureIndex], [field]: value };
        return { ...prev, subfeatures: newSubfeatures };
      }
      return { ...prev, [field]: value };
    });
    
    setHtmlContent(prevContent => {
      let newContent = prevContent;
      const templateType = searchParams.get('template') || 'offer';
      
      if (templateType === 'offer') {
        switch(field) {
          case 'mainBannerImage':
            newContent = newContent.replace(
              /(<!-- Main Banner Image -->[\s\S]*?<img[^>]*src=")[^"]*(")/g,
              `$1${value}$2`
            );
            break;
          case 'mainBannerLink':
            newContent = newContent.replace(
              /(<!-- Main Banner Link -->[\s\S]*?<a[^>]*href=")[^"]*(")/g,
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
      } else {
        switch(field) {
          case 'previewTextHeader':
            newContent = newContent.replace(
              /(<!-- Preview Text -->[\s\S]*?<p[^>]*class="targetPreviewHeader"[^>]*>)(.*?)(<\/p>)/,
              `$1${value}$3`
            );
            break;
          case 'headerBannerImage':
            newContent = newContent.replace(
              /(<!-- Header Banner Image -->[\s\S]*?<img[^>]*src=")[^"]*(")/g,
              `$1${value}$2`
            );
            break;
          case 'headerBannerLink':
            newContent = newContent.replace(
              /(<!-- Header Banner Link-->[\s\S]*?<a[^>]*href=")[^"]*(")/g,
              `$1${value}$2`
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
          case 'image':
          case 'link':
          case 'line1':
          case 'line2':
            if (subfeatureIndex !== null) {
              const subfeatureNumber = subfeatureIndex + 1;
              if (field === 'image') {
                newContent = newContent.replace(
                  new RegExp(`(<img[^>]*class="subfeature"[^>]*?src=")[^"]*(")`),
                  `$1${value}$2`
                );
              } else if (field === 'link') {
                newContent = newContent.replace(
                  new RegExp(`(<a[^>]*href=")[^"]*("[^>]*>\\s*<img[^>]*class="subfeature")`),
                  `$1${value}$2`
                );
              } else if (field === 'line1') {
                newContent = newContent.replace(
                  new RegExp(`(<div class="subfeature-line1"[^>]*>)[^<]*(</div>)`),
                  `$1${value}$2`
                );
              } else if (field === 'line2') {
                newContent = newContent.replace(
                  new RegExp(`(<div class="subfeature-line2"[^>]*>)[^<]*(</div>)`),
                  `$1${value}$2`
                );
              }
            }
            break;
          case 'subBannerImage':
          case 'subBannerLink':
            if (subfeatureIndex !== null) {
              const bannerNumber = subfeatureIndex + 1;
              if (field === 'subBannerImage') {
                newContent = newContent.replace(
                  new RegExp(`(<img[^>]*class="[^"]*targetSubBannerImage${bannerNumber}[^"]*"[^>]*src=")[^"]*(")`),
                  `$1${value}$2`
                );
              } else if (field === 'subBannerLink') {
                newContent = newContent.replace(
                  new RegExp(`(<a[^>]*class="targetSubBannerLink${bannerNumber}"[^>]*href=")[^"]*(")`),
                  `$1${value}$2`
                );
              }
            }
            break;
        }
      }
      
      return newContent;
    });
  }, [searchParams]);

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
        {templateType === 'wfe' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Text Header
            </label>
            <input
              type="text"
              value={template.previewTextHeader}
              onChange={(e) => updateTemplate('previewTextHeader', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        )}

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

        {templateType === 'offer' ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Banner Image
              </label>
              <input
                type="text"
                value={template.mainBannerImage}
                onChange={(e) => updateTemplate('mainBannerImage', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Banner Link
              </label>
              <input
                type="text"
                value={template.mainBannerLink}
                onChange={(e) => updateTemplate('mainBannerLink', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Banner Image
              </label>
              <input
                type="text"
                value={template.headerBannerImage}
                onChange={(e) => updateTemplate('headerBannerImage', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Banner Link
              </label>
              <input
                type="text"
                value={template.headerBannerLink}
                onChange={(e) => updateTemplate('headerBannerLink', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Banner Image
              </label>
              <input
                type="text"
                value={template.mainBannerImage}
                onChange={(e) => updateTemplate('mainBannerImage', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Banner Link
              </label>
              <input
                type="text"
                value={template.mainBannerLink}
                onChange={(e) => updateTemplate('mainBannerLink', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>
          <DraftEditor
            key={`email-body-${templateType}-${template.emailBody}`}
            content={template.emailBody}
            onChange={(html) => updateTemplate('emailBody', html)}
            defaultFontSize="18"
          />
        </div>

        {templateType === 'offer' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <DraftEditor
              key={`terms-content-${templateType}-${template.termsContent}`}
              content={template.termsContent}
              onChange={(html) => updateTemplate('termsContent', html)}
              defaultFontSize="12"
            />
          </div>
        )}

        {templateType === 'wfe' && template.subfeatures?.map((subfeature, index) => (
          <div key={index} className="mb-6 p-4 border rounded-md">
            <h3 className="font-medium mb-4">Subfeature {index + 1}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={subfeature.image}
                  onChange={(e) => updateTemplate('image', e.target.value, index)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                <input
                  type="text"
                  value={subfeature.link}
                  onChange={(e) => updateTemplate('link', e.target.value, index)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line 1</label>
                <input
                  type="text"
                  value={subfeature.line1}
                  onChange={(e) => updateTemplate('line1', e.target.value, index)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line 2</label>
                <input
                  type="text"
                  value={subfeature.line2}
                  onChange={(e) => updateTemplate('line2', e.target.value, index)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        ))}

        {templateType === 'wfe' && template.subBanners?.map((banner, index) => (
          <div key={`subbanner-${index}`} className="mb-6 p-4 border rounded-md">
            <h3 className="font-medium mb-4">Sub Banner {index + 1}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={banner.image}
                  onChange={(e) => updateTemplate('subBannerImage', e.target.value, index)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                <input
                  type="text"
                  value={banner.link}
                  onChange={(e) => updateTemplate('subBannerLink', e.target.value, index)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        ))}
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