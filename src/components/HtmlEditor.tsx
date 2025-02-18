import { useState } from 'react';

const HtmlEditor = () => {
    const [htmlInput, setHtmlInput] = useState('');
    const [htmlOutput, setHtmlOutput] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    // Options from UTMGenerator
    const sourceOptions = [
        { value: 'clutch', label: 'Clutch' },
        { value: 'mailchimp', label: 'Mailchimp' },
    ];

    const mediumOptions = [
        { value: 'email', label: 'Email' }
    ];

    const campaignOptions = [
        { value: 'offer', label: 'Neighbor Rewards' },
        { value: 'sse', label: 'Single Subject' },
        { value: 'wfe', label: 'Weekly Flyer' }
    ];

    const [formData, setFormData] = useState({
        source: '',
        medium: '',
        campaign: '',
        sendDate: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHtmlInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHtmlInput(e.target.value);
    };

    const generateUTMString = (linkNumber: number) => {
        // Validation
        if (!formData.source || !formData.medium || !formData.campaign) {
            return null;
        }

        // Process campaign name with date if present
        const campaignName = formData.sendDate
            ? (() => {
                const [year, month, day] = formData.sendDate.split('-');
                return `${formData.campaign}_${month}${day}${year.slice(-2)}`;
              })()
            : formData.campaign;

        // Define UTM parameters
        const utmParams = new Map([
            ['utm_source', formData.source],
            ['utm_medium', formData.medium],
            ['utm_campaign', campaignName],
            ['utm_content', `content_${linkNumber}`]
        ]);

        // Build query string
        return Array.from(utmParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
    };

    const cleanUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            // Remove all UTM parameters
            const cleanParams = new URLSearchParams();
            urlObj.searchParams.forEach((value, key) => {
                if (!key.startsWith('utm_')) {
                    cleanParams.append(key, value);
                }
            });
            urlObj.search = cleanParams.toString();
            return urlObj.toString();
        } catch {
            // If URL parsing fails, return the original URL
            console.error('Invalid URL:', url);
            return url;
        }
    };

    const handleGenerate = () => {
        // Validate required fields first
        if (!formData.source || !formData.medium || !formData.campaign) {
            alert('Please fill in all required fields (source, medium, and campaign)');
            return;
        }

        let linkCount = 0;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlInput, 'text/html');
        const links = doc.getElementsByTagName('a');

        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const href = link.getAttribute('href');
            
            // Skip if no href
            if (!href) continue;
            
            // Process only newseasonsmarket.com links
            if (href.includes('newseasonsmarket.com')) {
                linkCount++;
                const utmString = generateUTMString(linkCount);
                const cleanedUrl = cleanUrl(href);
                const connector = cleanedUrl.includes('?') ? '&' : '?';
                const newUrl = `${cleanedUrl}${connector}${utmString}`;
                link.setAttribute('href', newUrl);
            }
        }

        // Get the full HTML content including head and body
        const serializer = new XMLSerializer();
        const fullHtml = serializer.serializeToString(doc);
        
        // Clean up the serialized HTML by removing XML artifacts
        const cleanHtml = fullHtml
            .replace(/xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, '')
            .replace(/<(\/?)html>/g, '<$1html>')
            .replace(/<(\/?)head>/g, '<$1head>')
            .replace(/<(\/?)body>/g, '<$1body>');

        setHtmlOutput(cleanHtml);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(htmlOutput);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy');
            console.error('Copy failed:', err);
        }
    };

    return (
        <main className="flex h-[calc(100vh-100px)]">
            {/* Left Panel */}
            <div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
                <div className="flex flex-col h-full">
                    {/* Grid Container for Dropdowns */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Source Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Source
                            </label>
                            <select
                                name="source"
                                value={formData.source}
                                onChange={handleInputChange}
                                className="w-full h-[38px] px-2 border border-gray-300 rounded-md"
                            >
                                <option value="" disabled></option>
                                {sourceOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Medium Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medium
                            </label>
                            <select
                                name="medium"
                                value={formData.medium}
                                onChange={handleInputChange}
                                className="w-full h-[38px] px-2 border border-gray-300 rounded-md"
                            >
                                <option value="" disabled></option>
                                {mediumOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Campaign Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Campaign
                            </label>
                            <select
                                name="campaign"
                                value={formData.campaign}
                                onChange={handleInputChange}
                                className="w-full h-[38px] px-2 border border-gray-300 rounded-md"
                            >
                                <option value="" disabled></option>
                                {campaignOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Send Date Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Send Date
                            </label>
                            <input
                                type="date"
                                name="sendDate"
                                value={formData.sendDate}
                                onChange={handleInputChange}
                                className="w-full h-[38px] px-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* HTML Input Section - Fill remaining space */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">HTML Input</span>
                            <button
                                onClick={handleGenerate}
                                className="px-3 py-1 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                            >
                                Generate
                            </button>
                        </div>
                        <textarea
                            value={htmlInput}
                            onChange={handleHtmlInputChange}
                            className="flex-1 w-full p-2 border rounded-md font-mono text-sm bg-white"
                            style={{ resize: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex flex-col">
                <div className="flex-1 bg-white">
                    <iframe
                        srcDoc={htmlOutput || `
                            <!DOCTYPE html>
                            <html>
                                <head>
                                    <meta charset="UTF-8">
                                </head>
                                <body>
                                    <p>HTML preview will appear here...</p>
                                </body>
                            </html>
                        `}
                        className="w-full h-full border-0"
                        title="HTML Preview"
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
                        value={htmlOutput}
                        className="w-full h-32 p-2 border rounded-md font-mono text-sm bg-white"
                        style={{ resize: 'none' }}
                    />
                </div>
            </div>
        </main>
    );
};

export default HtmlEditor; 