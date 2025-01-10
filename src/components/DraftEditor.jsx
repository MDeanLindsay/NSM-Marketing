'use client';
import { useState, useEffect } from 'react';
import { EditorState, ContentState, convertToRaw, convertFromHTML, RichUtils, Modifier } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import 'draft-js/dist/Draft.css';

// Predefined options
const COLORS = [
  { label: 'Default', value: '#646464' },
  { label: 'Black', value: '#000000' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Red', value: '#DC2626' },
];

const FONT_SIZES = [
  { label: '12px', value: '12' },
  { label: '14px', value: '14' },
  { label: '16px', value: '16' },
  { label: '18px', value: '18' },
  { label: '20px', value: '20' },
  { label: '24px', value: '24' },
];

// Custom button component for the ribbon
const RibbonButton = ({ active, label, icon, onToggle }) => (
  <button
    className={`p-2 rounded-md transition-colors ${
      active 
        ? 'bg-gray-200 text-gray-900' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
    onClick={onToggle}
    title={label}
  >
    <span className="material-icons text-lg">{icon}</span>
  </button>
);

// Dropdown component for colors and font sizes
const StyleDropdown = ({ icon, current, options, onChange, label }) => (
  <div className="relative group">
    <button
      className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
      title={label}
    >
      <span className="material-icons text-lg">{icon}</span>
      <span className="text-sm">{current}</span>
    </button>
    
    <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-2 z-50 min-w-[100px]">
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md"
          >
            {icon === 'format_color_text' && (
              <span 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: option.value }}
              />
            )}
            <span className="text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default function DraftEditor({ onChange, content, defaultFontSize = '18' }) {
  const [editorState, setEditorState] = useState(() => {
    if (content) {
      const blocksFromHTML = convertFromHTML(content);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      const newState = EditorState.createWithContent(contentState);
      
      // Apply default font size
      const selection = newState.getSelection();
      const nextContentState = Modifier.applyInlineStyle(
        newState.getCurrentContent(),
        selection.merge({
          anchorOffset: 0,
          focusOffset: contentState.getPlainText().length,
        }),
        `FONTSIZE_${defaultFontSize}`
      );
      
      return EditorState.push(newState, nextContentState, 'change-inline-style');
    }
    return EditorState.createEmpty();
  });

  const generateHTML = (contentState) => {
    const blocks = convertToRaw(contentState).blocks;
    return blocks.map(block => {
      if (!block.text) return '<p><br></p>';

      // Create an array to track styling for each character
      const textLength = block.text.length;
      const styleMap = Array(textLength).fill().map(() => ({
        color: null,
        fontSize: defaultFontSize,
        bold: false,
        italic: false,
        underline: false
      }));

      // Apply styles to the styleMap
      block.inlineStyleRanges.forEach(range => {
        const { offset, length, style } = range;
        for (let i = offset; i < offset + length; i++) {
          if (style.startsWith('COLOR_')) {
            styleMap[i].color = style.replace('COLOR_', '');
          } else if (style.startsWith('FONTSIZE_')) {
            styleMap[i].fontSize = style.replace('FONTSIZE_', '');
          } else if (style === 'BOLD') {
            styleMap[i].bold = true;
          } else if (style === 'ITALIC') {
            styleMap[i].italic = true;
          } else if (style === 'UNDERLINE') {
            styleMap[i].underline = true;
          }
        }
      });

      // Generate HTML with optimized tag structure
      let html = '';
      let currentStyles = null;
      
      for (let i = 0; i < textLength; i++) {
        const char = block.text[i];
        const styles = styleMap[i];
        
        // Check if styles changed
        if (!currentStyles || 
            currentStyles.color !== styles.color ||
            currentStyles.fontSize !== styles.fontSize ||
            currentStyles.bold !== styles.bold ||
            currentStyles.italic !== styles.italic ||
            currentStyles.underline !== styles.underline) {
          
          // Close previous style tags if they exist
          if (currentStyles) {
            if (currentStyles.underline) html += '</u>';
            if (currentStyles.italic) html += '</em>';
            if (currentStyles.bold) html += '</strong>';
            if (currentStyles.color || currentStyles.fontSize) html += '</span>';
          }
          
          // Open new style tags
          const styleAttrs = [];
          if (styles.color) styleAttrs.push(`color: ${styles.color}`);
          if (styles.fontSize) styleAttrs.push(`font-size: ${styles.fontSize}px`);
          
          if (styleAttrs.length > 0) {
            html += `<span style="${styleAttrs.join('; ')}">`;
          }
          if (styles.bold) html += '<strong>';
          if (styles.italic) html += '<em>';
          if (styles.underline) html += '<u>';
          
          currentStyles = styles;
        }
        
        html += char;
      }
      
      // Close any remaining tags
      if (currentStyles) {
        if (currentStyles.underline) html += '</u>';
        if (currentStyles.italic) html += '</em>';
        if (currentStyles.bold) html += '</strong>';
        if (currentStyles.color || currentStyles.fontSize) html += '</span>';
      }

      return `<p style="font-size: ${defaultFontSize}px; line-height: ${parseInt(defaultFontSize) * 1.5}px;">${html}</p>`;
    }).join('\n');
  };

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    const html = generateHTML(newEditorState.getCurrentContent());
    onChange(html);
  };

  const toggleInlineStyle = (style) => (e) => {
    e.preventDefault();
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const applyColor = (color) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    let nextContentState = currentContent;

    // Remove existing color styles
    const currentStyle = editorState.getCurrentInlineStyle();
    currentStyle.forEach(style => {
      if (style.startsWith('COLOR_')) {
        nextContentState = Modifier.removeInlineStyle(
          nextContentState,
          selection,
          style
        );
      }
    });

    // Apply new color
    const colorStyle = `COLOR_${color}`;
    nextContentState = Modifier.applyInlineStyle(
      nextContentState,
      selection,
      colorStyle
    );

    handleEditorChange(
      EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
      )
    );
  };

  const applyFontSize = (size) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    let nextContentState = currentContent;

    // Remove existing font size styles
    const currentStyle = editorState.getCurrentInlineStyle();
    currentStyle.forEach(style => {
      if (style.startsWith('FONTSIZE_')) {
        nextContentState = Modifier.removeInlineStyle(
          nextContentState,
          selection,
          style
        );
      }
    });

    // Apply new font size
    const sizeStyle = `FONTSIZE_${size}`;
    nextContentState = Modifier.applyInlineStyle(
      nextContentState,
      selection,
      sizeStyle
    );

    handleEditorChange(
      EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
      )
    );
  };

  // Get current styles
  const currentStyle = editorState.getCurrentInlineStyle();
  const currentColor = Array.from(currentStyle)
    .find(style => style.startsWith('COLOR_'))
    ?.replace('COLOR_', '') || null;
  const currentFontSize = Array.from(currentStyle)
    .find(style => style.startsWith('FONTSIZE_'))
    ?.replace('FONTSIZE_', '') || defaultFontSize;

  return (
    <div className="relative bg-white border rounded-md">
      {/* Formatting Ribbon */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        {/* Text Style Controls */}
        <div className="flex items-center gap-1 pr-2 border-r">
          <RibbonButton
            active={currentStyle.has('BOLD')}
            label="Bold"
            icon="format_bold"
            onToggle={toggleInlineStyle('BOLD')}
          />
          <RibbonButton
            active={currentStyle.has('ITALIC')}
            label="Italic"
            icon="format_italic"
            onToggle={toggleInlineStyle('ITALIC')}
          />
          <RibbonButton
            active={currentStyle.has('UNDERLINE')}
            label="Underline"
            icon="format_underlined"
            onToggle={toggleInlineStyle('UNDERLINE')}
          />
        </div>

        {/* Font Size and Color */}
        <div className="flex items-center gap-1">
        <StyleDropdown
            icon="format_color_text"
            current=""
            options={COLORS}
            onChange={applyColor}
            label="Text Color"
          />
          <StyleDropdown
            icon="format_size"
            current={`${currentFontSize}px`}
            options={FONT_SIZES}
            onChange={applyFontSize}
            label="Font Size"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}