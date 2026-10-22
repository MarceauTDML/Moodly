import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { CheckinMood } from '../../types/checkin.types';

// Des visages SVG pour conserver le même rendu sur mobile et dans le navigateur.
export function MoodFace({ mood }: { mood: CheckinMood }) {
  const gradient = `face-${mood}`;
  return (
    <Svg width={38} height={38} viewBox="0 0 48 48" aria-hidden={true}>
      <Defs>
        <LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFF58C" />
          <Stop offset="0.6" stopColor="#FFD23D" />
          <Stop offset="1" stopColor="#F4A726" />
        </LinearGradient>
      </Defs>
      <Circle cx={24} cy={24} r={21} fill={`url(#${gradient})`} stroke="#E9A222" strokeWidth={1} />
      <Circle cx={15} cy={27} r={4} fill="#F3AF42" opacity={0.35} />
      <Circle cx={33} cy={27} r={4} fill="#F3AF42" opacity={0.35} />
      {mood === 'EPANOUI' ? (
        <>
          <Path
            d="M12 21Q16 13 20 21M28 21Q32 13 36 21"
            fill="none"
            stroke="#664311"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d="M12 27Q24 46 36 27Z"
            fill="#794411"
            stroke="#794411"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <Path d="M14 28L34 28L31 32L17 32Z" fill="#FFF" />
        </>
      ) : (
        <>
          <Circle cx={16} cy={20} r={2.2} fill="#664311" />
          <Circle cx={32} cy={20} r={2.2} fill="#664311" />
          <Path
            d={
              mood === 'BIEN'
                ? 'M15 29Q24 38 33 29'
                : mood === 'MOYEN'
                  ? 'M17 32H31'
                  : 'M16 35Q24 25 32 35'
            }
            fill="none"
            stroke="#794411"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          {mood === 'STRESSE' && (
            <Path
              d="M12 14L19 12M29 12L36 14"
              stroke="#9D6720"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          )}
        </>
      )}
    </Svg>
  );
}
