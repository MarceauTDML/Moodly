import Svg, { Circle, Ellipse, Path, G, Line } from 'react-native-svg';
import type { MoodStatus } from '../../types/mood.types';
import { moodStatusColors } from '../../theme/moodStatusColors';
import { useAppTheme } from '../../theme/ThemeProvider';
// Illustration vectorielle : elle reste nette sur tous les ecrans.
export function MoodMascot({ status }: { status: MoodStatus }) {
  const { scheme } = useAppTheme();
  const palette = moodStatusColors[scheme][status];
  const perfect = status === 'PARFAIT';
  const worried = status === 'PREOCCUPANT';
  return (
    <Svg
      width="100%"
      height={165}
      viewBox="0 0 390 165"
      accessibilityLabel={perfect ? 'Soleil souriant' : worried ? 'Ciel orageux' : 'Ciel nuageux'}
    >
      {!perfect && (
        <G fill={worried ? '#26374D' : '#F5F9FD'}>
          <Path d="M0 55C22 40 42 54 45 74C74 73 85 118 52 126H0Z" />
          <Path d="M390 65C365 49 343 63 343 86C308 80 292 122 331 130H390Z" />
          {worried ? (
            <>
              <Path d="M11 133L4 156L17 149L10 164L34 134Z" fill="#FFE089" />
              <Path d="M371 136L365 159L378 153L372 165L392 136Z" fill="#FFE089" />
            </>
          ) : (
            <G stroke="#9DBBD4" strokeWidth={2}>
              <Line x1={20} y1={137} x2={15} y2={150} />
              <Line x1={46} y1={141} x2={41} y2={154} />
              <Line x1={344} y1={140} x2={339} y2={154} />
              <Line x1={370} y1={139} x2={365} y2={153} />
            </G>
          )}
        </G>
      )}
      {perfect &&
        Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <Line
              key={i}
              x1={195 + Math.sin(a) * 66}
              y1={81 + Math.cos(a) * 66}
              x2={195 + Math.sin(a) * 72}
              y2={81 + Math.cos(a) * 72}
              stroke={palette.face}
              strokeWidth={5}
              strokeLinecap="round"
            />
          );
        })}
      <Circle cx={195} cy={81} r={57} fill={palette.face} />
      <Ellipse cx={166} cy={88} rx={7} ry={4} fill={palette.cheek} />
      <Ellipse cx={224} cy={88} rx={7} ry={4} fill={palette.cheek} />
      {perfect ? (
        <>
          <Path
            d="M167 76Q174 56 182 76 M207 76Q215 56 222 76"
            fill="none"
            stroke="#283B63"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path d="M177 90H213Q209 119 195 119Q181 119 177 90" fill="#283B63" />
          <Path d="M179 90H211L209 97H181Z" fill="#FFF" />
        </>
      ) : (
        <>
          <Ellipse cx={174} cy={76} rx={3.2} ry={4.8} fill="#283B54" />
          <Ellipse cx={216} cy={76} rx={3.2} ry={4.8} fill="#283B54" />
          <Path
            d={worried ? 'M178 109Q195 84 212 109' : 'M180 106H210'}
            fill="none"
            stroke="#283B54"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {worried && (
            <Path
              d="M166 64Q175 64 180 55 M210 55Q214 64 224 64"
              fill="none"
              stroke="#283B54"
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}
        </>
      )}
    </Svg>
  );
}
