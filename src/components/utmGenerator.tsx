import { useState } from 'react';

const UTMGenerator = () => {
    const [mode, setMode] = useState<'email' | 'social'>('email');
    const [rows, setRows] = useState([{
        id: '1',
        formData: {
            url: '',
            source: '',
            medium: '',
            campaign: '',
            content: '',
            sendDate: ''
        },
        generatedUTM: ''
    }]);

    const sourceOptions = {
        social: [
            { value: 'facebook', label: 'Facebook' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'meta', label: 'Meta' },
            { value: 'pinterest', label: 'Pinterest' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'twitter', label: 'Twitter' },
            { value: 'youtube', label: 'Youtube' }
        ],
        email: [
            { value: 'clutch', label: 'Clutch' },
            { value: 'mailchimp', label: 'Mailchimp' },
        ]
    };

    const mediumOptions = {
        social: [
            { value: 'cpc', label: 'Ad' },
            { value: 'social', label: 'Social' }
        ],
        email: [
            { value: 'email', label: 'Email' }
        ]
    };

    const campaignOptions = {
        social: [
            { value: 'fcbk', label: 'Facebook Ad' },
            { value: 'fcbkpost', label: 'Facebook Post' },
            { value: 'instagram', label: 'Instagram Ad' },
            { value: 'instapost', label: 'Instagram Post' },
            { value: 'pinterest', label: 'Pinterest Ad' },
            { value: 'pinpost', label: 'Pinterest Post' },
        ],
        email: [
            { value: 'offer', label: 'Neighbor Rewards' },
            { value: 'sse', label: 'Single Subject' },
            { value: 'wfe', label: 'Weekly Flyer' }
        ]
    };

    const handleInputChange = (rowId: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRows(prevRows => prevRows.map(row =>
            row.id === rowId
                ? {
                    ...row,
                    formData: {
                        ...row.formData,
                        [name]: value
                    }
                }
                : row
        ));
    };

    const handleModeChange = (newMode: 'social' | 'email') => {
        setMode(newMode);
        setRows(prevRows => prevRows.map(row => ({
            ...row,
            formData: {
                url: row.formData.url, // Preserve the URL
                source: '',
                medium: '',
                campaign: '',
                content: '',
                sendDate: ''
            },
            generatedUTM: ''
        })));
    };

    const addNewRow = () => {
        setRows(prevRows => [...prevRows, {
            id: Date.now().toString(),
            formData: {
                url: '',
                source: '',
                medium: '',
                campaign: '',
                content: '',
                sendDate: ''
            },
            generatedUTM: ''
        }]);
    };


    const generateUTM = (rowId: string) => {
        const row = rows.find(r => r.id === rowId);
        if (!row) return;

        // Consolidated validation
        const validationError = !row.formData.url 
            ? 'Add the url.'
            : !row.formData.campaign
            ? 'Add a campaign name.'
            : null;

        if (validationError) {
            setRows(prevRows => prevRows.map(r =>
                r.id === rowId ? { ...r, generatedUTM: validationError } : r
            ));
            return;
        }

        // Process campaign name with date if present
        const campaignName = row.formData.sendDate
            ? (() => {
                const [year, month, day] = row.formData.sendDate.split('-');
                return `${row.formData.campaign}_${month}${day}${year.slice(-2)}`;
              })()
            : row.formData.campaign;

        // Define UTM parameters mapping
        const utmParams = new Map([
            ['utm_source', row.formData.source],
            ['utm_medium', row.formData.medium],
            ['utm_campaign', campaignName],
            ['utm_content', row.formData.content]
        ]);

        // Build URL with parameters
        const baseUrl = row.formData.url;
        const connector = baseUrl.includes('?') ? '&' : '?';
        const queryParams = Array.from(utmParams)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        const finalUrl = queryParams
            ? `${baseUrl}${connector}${queryParams}`
            : baseUrl;

        setRows(prevRows => prevRows.map(r =>
            r.id === rowId ? { ...r, generatedUTM: finalUrl } : r
        ));
    };

    const copyToClipboard = (utmString: string) => {
        navigator.clipboard.writeText(utmString);
    };


    return (
        <div className="flex justify-center items-center h-[calc(100vh-100px)] p-4">
            <div className="bg-gray-100 rounded-lg shadow-lg p-4 w-[1500px] min-h-[400px] mx-auto flex flex-col">
            
                {/* Mode Toggle Buttons */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={() => handleModeChange('email')}
                        className={`px-6 py-2 rounded-md font-medium font-nsm ${mode === 'email'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors duration-200`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => handleModeChange('social')}
                        className={`px-6 py-2 rounded-md font-medium font-nsm ${mode === 'social'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors duration-200`}
                    >
                        Socials
                    </button>
                </div>

                {/* UTM Rows */}
                <div className="flex flex-col">
                    {rows.map((row, index) => (
                        <div key={row.id}>
                            <div className="flex flex-row gap-2 py-4">
                                {/* Add Button Column */}
                                <div className="w-[38px] flex items-end">
                                    {index === 0 && (
                                        <button
                                            onClick={addNewRow}
                                            disabled={rows.length >= 6}
                                            className={`h-[38px] w-[38px] flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${rows.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Left side inputs */}
                                <div className="flex-1 flex gap-2">
                                    <div className="w-[200px]">
                                        {index === 0 && (
                                            <label className="block text-sm font-medium font-nsm text-gray-700 mb-2">
                                                URL
                                            </label>
                                        )}
                                        <input
                                            type="text"
                                            name="url"
                                            value={row.formData.url}
                                            onChange={(e) => handleInputChange(row.id, e)}
                                            className={`w-full h-[38px] px-2 border border-gray-300 rounded-md ${index === 0 ? '' : 'mt-6'}`}
                                        />
                                    </div>

                                    <div className="w-[150px]">
                                        {index === 0 && (
                                            <label className="block text-sm font-medium font-nsm text-gray-700 mb-2">
                                                Source
                                            </label>
                                        )}
                                        <select
                                            name="source"
                                            value={row.formData.source}
                                            onChange={(e) => handleInputChange(row.id, e)}
                                            className={`w-full h-[38px] px-2 border border-gray-300 rounded-md ${index === 0 ? '' : 'mt-6'}`}
                                        >
                                            <option value="" disabled></option>
                                            {sourceOptions[mode].map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-[150px]">
                                        {index === 0 && (
                                            <label className="block text-sm font-medium font-nsm text-gray-700 mb-2">
                                                Medium
                                            </label>
                                        )}
                                        <select
                                            name="medium"
                                            value={row.formData.medium}
                                            onChange={(e) => handleInputChange(row.id, e)}
                                            className={`w-full h-[38px] px-2 border border-gray-300 rounded-md ${index === 0 ? '' : 'mt-6'}`}
                                        >
                                            <option value="" disabled></option>
                                            {mediumOptions[mode].map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-[150px]">
                                        {index === 0 && (
                                            <label className="block text-sm font-medium font-nsm text-gray-700 mb-2">
                                                Campaign
                                            </label>
                                        )}
                                        <select
                                            name="campaign"
                                            value={row.formData.campaign}
                                            onChange={(e) => handleInputChange(row.id, e)}
                                            className={`w-full h-[38px] px-2 border border-gray-300 rounded-md ${index === 0 ? '' : 'mt-6'}`}
                                        >
                                            <option value="" disabled></option>
                                            {campaignOptions[mode].map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-[150px]">
                                        {index === 0 && (
                                            <label className="block text-sm font-medium font-nsm text-gray-700 mb-2">
                                                {mode === 'email' ? 'Send Date' : 'Post Date'}
                                            </label>
                                        )}
                                        <input
                                            type="date"
                                            name="sendDate"
                                            value={row.formData.sendDate}
                                            onChange={(e) => handleInputChange(row.id, e)}
                                            className={`w-full h-[38px] px-2 border border-gray-300 rounded-md ${index === 0 ? '' : 'mt-6'}`}
                                        />
                                    </div>

                                    <div className="w-[150px]">
                                        {index === 0 && (
                                            <label className="block text-sm font-medium font-nsm text-gray-700 mb-2">
                                                Content
                                            </label>
                                        )}
                                        <input
                                            type="text"
                                            name="content"
                                            value={row.formData.content}
                                            onChange={(e) => handleInputChange(row.id, e)}
                                            className={`w-full h-[38px] px-2 border border-gray-300 rounded-md ${index === 0 ? '' : 'mt-6'}`}
                                        />
                                    </div>
                                </div>

                                {/* Generate and Output section */}
                                <div className="flex items-end">
                                    <button
                                        onClick={() => generateUTM(row.id)}
                                        className="bg-gray-800 text-white font-nsm hover:bg-gray-700 rounded-md h-[38px] px-6"
                                    >
                                        Generate
                                    </button>
                                </div>

                                <div className="w-[400px] flex items-end">
                                    <div className="w-full bg-gray-50 rounded-md">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="text"
                                                value={row.generatedUTM}
                                                readOnly
                                                placeholder=""
                                                className={`flex-1 h-[38px] px-2 border border-gray-300 rounded-md bg-white overflow-x-auto ${!row.generatedUTM ? 'text-gray-400' : ''}`}
                                            />
                                            <button
                                                onClick={() => copyToClipboard(row.generatedUTM)}
                                                disabled={!row.generatedUTM}
                                                className={`${row.generatedUTM
                                                        ? 'bg-gray-800 text-white hover:bg-gray-700 rounded-md'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                    } text-white font-nsm h-[38px] px-4 rounded-md whitespace-nowrap`}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider line */}
                            {index < rows.length - 1 && (
                                <div className="px-2">
                                    <div className="border-b border-gray-200"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UTMGenerator;