import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Tab,
  Tabs,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { emojiCategories, EmojiCategory } from './emojiData';

interface EmojiPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  currentEmoji?: string;
}

const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  open,
  onClose,
  onSelectEmoji,
  currentEmoji,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!searchTerm) {
      return emojiCategories[selectedCategory].emojis;
    }

    // Si hay búsqueda, mostrar todos los emojis que coincidan de todas las categorías
    return emojiCategories.flatMap((category) => category.emojis);
  }, [selectedCategory, searchTerm]);

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedCategory(newValue);
    setSearchTerm('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
      sx={{
        zIndex: 10000,
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div">
          Seleccionar Emoji
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Campo de búsqueda */}
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar emoji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </Box>

        {/* Emoji seleccionado actualmente */}
        {currentEmoji && (
          <Box
            sx={{
              px: 2,
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Actual:
            </Typography>
            <Box
              sx={{
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 1,
                border: '2px solid',
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              }}
            >
              {currentEmoji}
            </Box>
          </Box>
        )}

        {/* Pestañas de categorías */}
        {!searchTerm && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 2,
                },
              }}
            >
              {emojiCategories.map((category: EmojiCategory, index: number) => (
                <Tab key={category.name} label={category.label} />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Grid de emojis */}
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
            gap: 1,
            minHeight: 300,
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          {filteredEmojis.map((emoji: string, index: number) => (
            <Box
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              sx={{
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 1,
                width: 48,
                height: 48,
                transition: 'all 0.2s',
                border: '2px solid transparent',
                bgcolor: emoji === currentEmoji ? 'action.selected' : 'transparent',
                borderColor: emoji === currentEmoji ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.2)',
                  zIndex: 1,
                },
              }}
            >
              {emoji}
            </Box>
          ))}
        </Box>

        {/* Mensaje cuando no hay resultados */}
        {filteredEmojis.length === 0 && (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No se encontraron emojis
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmojiPickerModal;
