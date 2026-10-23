import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useAppTheme } from '../../theme/ThemeProvider';
export type IconName =
  | 'users'
  | 'mail'
  | 'calendar'
  | 'clock'
  | 'check'
  | 'plus'
  | 'key'
  | 'search'
  | 'smile'
  | 'chart'
  | 'settings'
  | 'menu'
  | 'chevron'
  | 'back'
  | 'lock'
  | 'user'
  | 'bell'
  | 'logout'
  | 'refresh'
  | 'close'
  | 'info'
  | 'eye'
  | 'eye-off';
export function Icon({
  name,
  color,
  size = 24,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  const { colors } = useAppTheme();
  const paths: Partial<Record<IconName, string>> = {
    users:
      'M3 21V19A6 6 0 0 1 15 19V21 M13 3A4 4 0 0 1 13 11 M17 13A6 6 0 0 1 21 19V21 M12 7A4 4 0 1 1 4 7A4 4 0 0 1 12 7',
    mail: 'M3 5H21V19H3Z M3 6L12 13L21 6',
    calendar: 'M3 5H21V21H3Z M7 2V8 M17 2V8 M3 11H21 M7 15H8 M12 15H13 M7 18H8 M12 18H13',
    clock: 'M12 8V12L15 14 M22 12A10 10 0 1 1 2 12A10 10 0 0 1 22 12',
    check: 'M8 12L11 15L16 9 M22 12A10 10 0 1 1 2 12A10 10 0 0 1 22 12',
    plus: 'M12 5V19 M5 12H19',
    key: 'M14 3A6 6 0 1 1 14 15L7 22H2V17L8 11 M16 6L17 6',
    search: 'M21 21L16 16 M18 10A8 8 0 1 1 2 10A8 8 0 0 1 18 10',
    chart: 'M3 20V13 M8 20V10 M13 20V14 M18 20V6 M3 8L8 4L13 8L21 2',
    menu: 'M5 6H19 M5 12H19 M5 18H19',
    chevron: 'M9 5L16 12L9 19',
    back: 'M15 5L8 12L15 19',
    close: 'M6 6L18 18 M18 6L6 18',
    lock: 'M8 11V7A4 4 0 0 1 16 7V11 M12 15V18',
    user: 'M5 21V19A7 7 0 0 1 19 19V21 M16 6A4 4 0 1 1 8 6A4 4 0 0 1 16 6',
    bell: 'M18 8A6 6 0 0 0 6 8C6 15 3 16 3 17H21C21 16 18 15 18 8 M10 21H14',
    logout: 'M9 4H4V20H9 M12 12H22 M18 8L22 12L18 16',
    refresh: 'M20 10A8 8 0 1 0 19 17 M20 4V10H14',
    info: 'M12 10V17 M12 7V7.1',
    eye: 'M2 12C5 6.5 8.5 4.5 12 4.5S19 6.5 22 12C19 17.5 15.5 19.5 12 19.5S5 17.5 2 12Z',
    'eye-off':
      'M2 12C5 6.5 8.5 4.5 12 4.5S19 6.5 22 12C19 17.5 15.5 19.5 12 19.5S5 17.5 2 12Z M4 4L20 20',
    settings:
      'M9 3L8 6L5 7L3 10L5 12L3 15L5 18L8 19L9 22H14L15 19L19 18L21 15L19 12L21 9L19 6L15 5L14 2Z',
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'smile' ? (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M8 14Q12 19 16 14 M8.5 8.5V9 M15.5 8.5V9" />
        </>
      ) : (
        <Path d={paths[name]} />
      )}
      {name === 'lock' && <Rect x={5} y={11} width={14} height={11} rx={2} />}
      {name === 'settings' && <Circle cx={12} cy={12} r={3} />}
      {name === 'info' && <Circle cx={12} cy={12} r={10} />}
      {(name === 'eye' || name === 'eye-off') && <Circle cx={12} cy={12} r={3} />}
    </Svg>
  );
}
