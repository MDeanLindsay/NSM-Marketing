import { useState } from 'react';
import Image from 'next/image';

const UTMGenerator = () => {
    const [mode, setMode] = useState<'email' | 'social'>('email');
    const [formData, setFormData] = useState({
        url: '',
        source: '',
        medium: '',
        campaign: '',
        content: '',
        sendDate: ''
    });

    const [generatedUTM, setGeneratedUTM] = useState('');

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
            { value: 'loyalty', label: 'Neighbor Rewards' },
            { value: 'sse', label: 'Single Subject' },
            { value: 'wfe', label: 'Weekly Flyer' }
        ]
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleModeChange = (newMode: 'social' | 'email') => {
        setMode(newMode);
        setFormData({
            url: formData.url, // Preserve the URL
            source: '',
            medium: '',
            campaign: '',
            content: '',
            sendDate: ''
        });
        setGeneratedUTM('');
    };

    const generateUTM = () => {
        if (!formData.url) {
            setGeneratedUTM('Please add the link.');
            return;
        }
        if (!formData.campaign) {
            setGeneratedUTM('Please add a campaign name.');
            return;
        }

        const connector = formData.url.includes('?') ? '&' : '?';
        let utmString = formData.url + connector;

        // Format the campaign name with date if sendDate is selected
        let campaignName = formData.campaign;
        if (formData.sendDate) {
            // Split the date string directly instead of using Date object
            const [year, month, day] = formData.sendDate.split('-');
            // Use the last 2 digits of the year
            const shortYear = year.slice(-2);
            campaignName = `${formData.campaign}_${month}${day}${shortYear}`;
        }
        if (formData.source) {
            utmString += `&utm_source=${encodeURIComponent(formData.source)}`;
        }
        if (formData.medium) {
            utmString += `&utm_medium=${encodeURIComponent(formData.medium)}`;
        }
        if (campaignName) {
            utmString += `&utm_campaign=${encodeURIComponent(campaignName)}`;
        }
        if (formData.content) {
            utmString += `&utm_content=${encodeURIComponent(formData.content)}`;
        }

        setGeneratedUTM(utmString);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUTM);
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 w-[600px] mx-auto">
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
                        onClick={() => handleModeChange('email')}
                        className={`px-6 py-2 rounded-md font-medium ${mode === 'email'
                            ? 'bg-[#AFBE2B] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors duration-200`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => handleModeChange('social')}
                        className={`px-6 py-2 rounded-md font-medium ${mode === 'social'
                            ? 'bg-[#AFBE2B] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors duration-200`}
                    >
                        Socials
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL
                            <span className="text-gray-500 text-sm ml-2">- What is the landing page?</span>
                        </label>
                        <input
                            type="text"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        //placeholder="Enter URL"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Source
                            <span className="text-gray-500 text-sm ml-2">- What platform?</span>
                        </label>
                        <select
                            name="source"
                            value={formData.source}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled></option>
                            {sourceOptions[mode].map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medium
                            <span className="text-gray-500 text-sm ml-2">- How is it being shared?</span>
                        </label>
                        <select
                            name="medium"
                            value={formData.medium}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled></option>
                            {mediumOptions[mode].map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Campaign
                            <span className="text-gray-500 text-sm ml-2">- What is the campaign for?</span>
                        </label>
                        <select
                            name="campaign"
                            value={formData.campaign}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled></option>
                            {campaignOptions[mode].map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {mode === 'email' ? 'Send Date' : 'Post Date'}
                            <span className="text-gray-500 text-sm ml-2">- When is this scheduled?</span>
                        </label>
                        <input
                            type="date"
                            name="sendDate"
                            value={formData.sendDate}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content
                            <span className="text-gray-500 text-sm ml-2">- Any sub-descriptors?</span>
                        </label>
                        <input
                            type="text"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        //placeholder="Enter content descriptor"
                        />
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={generateUTM}
                            className="bg-[#AFBE2B] text-white px-6 py-2 rounded-md hover:bg-[#AFBE2B] focus:outline-none focus:ring-2 focus:ring-[#AFBE2B] focus:ring-offset-2"
                        >
                            Generate UTM
                        </button>
                    </div>

                    {generatedUTM && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    value={generatedUTM}
                                    readOnly
                                    className="flex-1 p-2 border border-gray-300 rounded-md bg-white overflow-x-auto"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-[#AFBE2B] text-white px-4 py-2 rounded-md hover:bg-[#AFBE2B] focus:outline-none focus:ring-2 focus:ring-[#AFBE2B] focus:ring-offset-2 whitespace-nowrap"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UTMGenerator;