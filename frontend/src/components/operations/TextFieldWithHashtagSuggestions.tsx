import React, { useState, useMemo } from 'react'
import { TextField, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface TextFieldWithHashtagSuggestionsProps {
  value: string
  onChange: (value: string) => void
  allHashtags: string[] // List of known hashtag names (without #)
  label?: string
  placeholder?: string
  multiline?: boolean
  rows?: number
  fullWidth?: boolean
  disabled?: boolean
}

const TextFieldWithHashtagSuggestions: React.FC<TextFieldWithHashtagSuggestionsProps> = ({
  value,
  onChange,
  allHashtags,
  label,
  placeholder,
  multiline = true,
  rows = 3,
  fullWidth = true,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const [cursorPos, setCursorPos] = useState(0)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Extract word being typed that starts with #
  // Returns null if no # found, or the word after # (empty string if just #)
  const currentWord = useMemo(() => {
    const textBeforeCursor = value.substring(0, cursorPos)
    const words = textBeforeCursor.split(/\s+/)
    const lastWord = words[words.length - 1]
    
    if (lastWord.startsWith('#')) {
      return lastWord.substring(1)
    }
    return null
  }, [value, cursorPos]) as string | null

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    if (currentWord === null) return []
    return allHashtags.filter(tag => 
      tag.toLowerCase().startsWith(currentWord.toLowerCase())
    )
  }, [currentWord, allHashtags])

  // Show suggestions when typing # (even just # alone)
  const showSuggestions = currentWord !== null && (currentWord.length === 0 || filteredSuggestions.length > 0)

  // Reset highlighted index when suggestions change
  React.useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredSuggestions])

  // Debug log
  React.useEffect(() => {
    console.log('TextFieldWithHashtagSuggestions - allHashtags:', allHashtags, 'currentWord:', currentWord, 'showSuggestions:', showSuggestions)
  }, [allHashtags, currentWord, showSuggestions])

  // Handle text field change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setCursorPos((e.target as any).selectionStart || 0)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    // Find the position of the # in the text before cursor
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastHashIndex = textBeforeCursor.lastIndexOf('#')
    
    if (lastHashIndex !== -1) {
      // Replace from # to current cursor position with #suggestion
      const newValue = value.substring(0, lastHashIndex) + 
                      '#' + suggestion + 
                      value.substring(cursorPos)
      
      onChange(newValue)
      const newCursorPos = lastHashIndex + suggestion.length + 1
      setCursorPos(newCursorPos)
    }
  }

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only handle arrow keys and Enter if suggestions are shown
    if (!showSuggestions || filteredSuggestions.length === 0) {
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const indexToSelect = highlightedIndex >= 0 ? highlightedIndex : 0
      handleSuggestionSelect(filteredSuggestions[indexToSelect])
      setHighlightedIndex(-1)
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        label={label || t('operations.fields.description') || 'Description'}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        disabled={disabled}
        helperText={t('operations.fields.descriptionHint') || 'Use #hashtag to tag this operation'}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            mt: 0.5,
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <Box
              key={index}
              onClick={() => {
                handleSuggestionSelect(suggestion)
                setHighlightedIndex(-1)
              }}
              sx={{
                p: 1,
                cursor: 'pointer',
                backgroundColor: highlightedIndex === index ? '#e3f2fd' : 'transparent',
                '&:hover': { backgroundColor: '#f0f0f0' },
                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              #{suggestion}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default TextFieldWithHashtagSuggestions
