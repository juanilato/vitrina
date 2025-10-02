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

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => {
  const parsed = dayjs(value, 'HH:mm');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <TimePicker
        ampm={false}
        views={['hours', 'minutes']}
        value={parsed}
        onChange={(newVal: dayjs.Dayjs | null) => {
          if (newVal) {
            onChange(newVal.format('HH:mm'));
          }
        }}
        minutesStep={30}
        desktopModeMediaQuery="none" // 💥 fuerza modo móvil con reloj
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            variant: 'outlined',
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default TimeInput;
