// TimeInput.tsx
import React from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

interface TimeInputProps {
  value: string;
  onChange: (val: string) => void;
}
// Time inputs de los schedule editor 
const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => {
  const parsed = dayjs(value, 'HH:mm');
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <TimePicker
        ampm={false}
        views={['hours', 'minutes']}
        minutesStep={30}
        value={parsed}
        onChange={(newVal) => { if (newVal) onChange(newVal.format('HH:mm')); }}
        desktopModeMediaQuery="none"
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            variant: 'outlined',
            className: 'mui-field',
          },
          openPickerButton: { className: 'mui-icon-btn' }
        }}
      />
    </LocalizationProvider>
  );
};

export default TimeInput;
