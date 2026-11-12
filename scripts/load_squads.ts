import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DB_FILE)) {
  console.error('db.json not found at:', DB_FILE);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const aliasMap: Record<string, string> = {
  'чертаново москва': 'Чертаново-мол.',
  'фк шахтёр': 'Шахтёр Д',
  'звезда санкт-петербург': 'Звезда СПб',
  'динамо санкт-петербург': 'Динамо-СПб',
  'нефтяник избербаш': 'Нефтяник И',
  'динамо-вологда': 'Динамо Вг',
  'авангард курск': 'Авангард К',
  'металлург липецк': 'Металлург Лп',
  'химик дзержинск': 'Химик Дз',
  'broke boys': 'Броуки (Brokeboys)',
  'фк матч': 'Матч ТВ',
  'зенит 2 санкт-петербург': 'Зенит-2',
  'динамо-2 махачкала': 'Динамо-2 Мх',
  'спартак тамбов': 'Спартак Тм',
  'зенит пенза': 'Зенит Пз',
  'победа нижний новгород': 'Победа НН',
  'сатурн раменское': 'Леон Сатурн',
  'строгино москва': 'Строгино',
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\"«»]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^фк\s+/, '')
    .replace(/\s+фк$/, '')
    .replace(/[-–—]/g, ' ')
    .trim();

function findTeam(rawName: string) {
  const clean = rawName.trim().replace(/:$/, '');
  const n = clean.toLowerCase();
  if (aliasMap[n]) return db.teams.find((t: any) => t.name === aliasMap[n]);
  let t = db.teams.find((x: any) => x.name.toLowerCase() === n);
  if (t) return t;
  const cn = norm(clean);
  t = db.teams.find((x: any) => norm(x.name) === cn);
  if (t) return t;
  const withoutCity = cn.replace(/\s+[а-яёa-z]+$/, '');
  t = db.teams.find((x: any) => norm(x.name) === withoutCity);
  if (t) return t;
  t = db.teams.find((x: any) => {
    const xn = norm(x.name);
    return cn.startsWith(xn + ' ') || cn.startsWith(xn + '-') || xn.startsWith(cn + ' ');
  });
  return t;
}

const MONTHS: Record<string, string> = {
  янв: '01', января: '01',
  фев: '02', февраля: '02',
  мар: '03', марта: '03',
  апр: '04', апреля: '04',
  май: '05', мая: '05',
  июн: '06', июня: '06',
  июл: '07', июля: '07',
  авг: '08', августа: '08',
  сен: '09', сент: '09', сентября: '09',
  окт: '10', октября: '10',
  ноя: '11', нояб: '11', ноября: '11',
  дек: '12', декабря: '12',
};

function parseBornDate(str: string): string {
  if (!str) return '';
  const m = str.match(/(\d{1,2})\s+([а-яё]+)\.?\s+(\d{4})/i);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mStr = m[2].toLowerCase().replace(/\.$/, '');
    const monthKey = Object.keys(MONTHS).find(k => mStr.startsWith(k));
    const month = monthKey ? MONTHS[monthKey] : '01';
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  const iso = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const yearOnly = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;
  return '';
}

const POS_MAP: Record<string, string> = {
  вратарь: 'ВР',
  'центр. защитник': 'ЦЗ',
  'левый защитник': 'ЛЗ',
  'правый защитник': 'ПЗ',
  защитник: 'ЦЗ',
  'опорный полузащитник': 'ОП',
  'центр. полузащитник': 'ЦП',
  'правый полузащитник': 'ПП',
  'левый полузащитник': 'ЛП',
  'атак. полузащитник': 'АП',
  'правый вингер': 'ПВ',
  'левый вингер': 'ЛВ',
  'центральный нап.': 'ЦФ',
  'центральный нападающий': 'ЦФ',
  нападающий: 'ЦФ',
  полузащитник: 'ЦП',
  'оттянутый нап.': 'ЦФ',
};

function mapPos(raw: string): string {
  const k = raw.trim().toLowerCase().replace(/\.$/, '');
  return POS_MAP[k] || 'ЦП';
}

function mapStaffRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('главный тренер') || t.includes('и.о. главного')) return 'head';
  if (t.includes('вратар')) return 'gk';
  if (t.includes('физ') || t.includes('фитнес') || t.includes('восстановлен')) return 'fitness';
  if (
    t.includes('доктор') ||
    t.includes('врач') ||
    t.includes('медицин') ||
    t.includes('массажист') ||
    t.includes('физиотерапевт') ||
    t.includes('травм')
  )
    return 'doctor';
  if (t.includes('аналитик')) return 'analyst';
  if (t.includes('скаут') || t.includes('селекци')) return 'scout';
  return 'assistant';
}

const STYLES_GK = [
  'Прыгучий голкипер с молниеносной реакцией на линии ворот и смелыми выходами',
  'Хладнокровный страж ворот, уверенно руководит обороной и командует на выходах',
  'Вратарь современной школы с превосходным первым пасом обеими ногами',
  'Опытный голкипер, силён в отражении пенальти и чтении траекторий дальних ударов',
];

const STYLES_DEF = [
  'Мощный центральный защитник, доминирует в верховых единоборствах и чистит штрафную',
  'Цепкий защитник-волнорез, силён в персональной опеке и отборе в подкате',
  'Скоростной латераль с неиссякаемой выносливостью и прицельными навесами в штрафную',
  'Умный позиционный защитник с отличным таймингом перехватов и диагональной передачей',
];

const STYLES_MID = [
  'Диспетчер центра поля с идеальным видением игры и разрезающими передачами',
  'Жесткий опорник-разрушитель, выигрывает подборы и перекрывает зоны контратак',
  'Техничный плеймейкер с дриблингом на носовом платке и поставленным кручёным ударом',
  'Динамичный полузащитник box-to-box, пашет от штрафной до штрафной без устали',
];

const STYLES_FWD = [
  'Взрывной дрибблер на фланге, разрывает оборону на скорости и смещается под удар',
  'Классический таранный форвард, продавливает защитников и безупречно играет головой',
  'Хитрый наконечник атак с голевым чутьём на добиваниях и рикошетах',
  'Юркий второй нападающий, стягивает на себя опекунов и создаёт свободные зоны',
];

const COACH_STYLES = [
  { style: 'possession', title: 'Контроль мяча и доминирование', form: '4-3-3' },
  { style: 'counter', title: 'Быстрые разящие контратаки', form: '5-3-2' },
  { style: 'pressing', title: 'Интенсивный высокий прессинг', form: '4-2-3-1' },
  { style: 'pragmatic', title: 'Строгая игровая дисциплина', form: '4-4-2' },
];

function getPlayerStyle(pos: string, idx: number): string {
  if (pos === 'ВР') return STYLES_GK[idx % STYLES_GK.length];
  if (['ЦЗ', 'ЛЗ', 'ПЗ', 'ЗАЩ'].includes(pos)) return STYLES_DEF[idx % STYLES_DEF.length];
  if (['ОП', 'ЦП', 'АП', 'ЛП', 'ПП', 'ПЗ'].includes(pos)) return STYLES_MID[idx % STYLES_MID.length];
  return STYLES_FWD[idx % STYLES_FWD.length];
}

function getBaseRating(comp: string): number {
  if (comp === 'rpl') return 75;
  if (comp === 'fnl') return 67;
  if (comp === '2la_gold' || comp === '2la_silver') return 61;
  if (comp?.startsWith('2lb')) return 58;
  if (comp === 'media' || comp === 'media_div2') return 62;
  return 60;
}

interface RawClubData {
  team: any;
  players: any[];
  staff: any[];
}

function parseFile(content: string, fileName: string): RawClubData[] {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const result: RawClubData[] = [];
  let currentClubData: RawClubData | null = null;
  let inStaff = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.startsWith('Пример:') ||
      line.startsWith('Номер, ФИО') ||
      line.startsWith('А вот эти составы') ||
      line.startsWith('Вот файл с составами')
    ) {
      continue;
    }
    if (line.startsWith('Тренерский штаб:')) {
      inStaff = true;
      continue;
    }
    const isClubHeader =
      (line.endsWith(':') && !line.startsWith('Клуб:')) ||
      line === 'Сатурн Раменское' ||
      line === 'Строгино Москва';

    if (isClubHeader) {
      const clubName = line.replace(/:$/, '').trim();
      const tm = findTeam(clubName);
      if (!tm) {
        console.warn(`[${fileName}] Club not found: ${clubName}`);
      }
      currentClubData = {
        team: tm,
        players: [],
        staff: [],
      };
      result.push(currentClubData);
      inStaff = false;
      continue;
    }

    if (!currentClubData || !currentClubData.team) continue;

    if (inStaff) {
      if (line.includes('—')) {
        const parts = line.split('—').map(s => s.trim());
        const roleTitle = parts[0];
        const rest = parts[1] || '';
        const restParts = rest.split(',').map(s => s.trim());
        const name = restParts[0] || '';
        const age = parseInt(restParts[1], 10) || 45;
        const nationality = restParts.slice(2).join(', ') || 'Россия';
        if (name) {
          currentClubData.staff.push({
            roleTitle,
            name,
            age,
            nationality,
          });
        }
      }
    } else {
      if (line.includes('—')) {
        // Media league format: "Дмитрий Ершов (ЕРШОВ) — Вратарь"
        const parts = line.split('—').map(s => s.trim());
        const name = parts[0];
        const posRaw = parts[1];
        if (name && posRaw) {
          currentClubData.players.push({
            num: null,
            name,
            pos: mapPos(posRaw),
            born: '',
            age: 24,
            nation: 'Россия',
          });
        }
      } else if (line.includes(',')) {
        // Professional format: "84, Адель Сорокин, Вратарь, 17 (31 янв. 2009 г.), Россия"
        const parts = line.split(',').map(s => s.trim());
        const num = parseInt(parts[0], 10) || null;
        const name = parts[1] || '';
        const posRaw = parts[2] || '';
        const bornRaw = parts[3] || '';
        const nation = parts.slice(4).join(', ') || 'Россия';
        const born = parseBornDate(bornRaw);
        const ageMatch = bornRaw.match(/^(\d{1,2})/);
        const age = ageMatch ? parseInt(ageMatch[1], 10) : 23;
        if (name) {
          currentClubData.players.push({
            num,
            name,
            pos: mapPos(posRaw),
            born,
            age,
            nation,
          });
        }
      }
    }
  }

  return result.filter(c => c.team !== null);
}

const f1Path = path.resolve('Состав (1).txt');
const f2Path = path.resolve('Состав (2).txt');

if (!fs.existsSync(f1Path) || !fs.existsSync(f2Path)) {
  console.error('Squad files not found:', f1Path, f2Path);
  process.exit(1);
}

const f1Content = fs.readFileSync(f1Path, 'utf8');
const f2Content = fs.readFileSync(f2Path, 'utf8');

const clubs1 = parseFile(f1Content, 'Состав (1).txt');
const clubs2 = parseFile(f2Content, 'Состав (2).txt');
const allParsedClubs = [...clubs1, ...clubs2];

console.log(`Parsed clubs: ${clubs1.length} in file 1, ${clubs2.length} in file 2. Total: ${allParsedClubs.length}`);

// We will build the new players, staff, squads, coaches
const newPlayers: any[] = [];
const newStaff: any[] = [];
const newSquads: Record<string, string[]> = {};
const newCoaches: Record<string, any> = typeof db.coaches === 'object' && !Array.isArray(db.coaches) ? { ...db.coaches } : {};

const processedTeamIds = new Set<string>();

for (const clubData of allParsedClubs) {
  const tm = clubData.team;
  if (!tm) continue;

  processedTeamIds.add(tm.id);
  const comp = tm.comp || 'rpl';
  const baseRating = getBaseRating(comp);

  const teamPlayerIds: string[] = [];

  // 1. Process players
  clubData.players.forEach((p, idx) => {
    const pid = `pl_${tm.id.slice(0, 6)}_${String(idx + 1).padStart(3, '0')}_${crypto.randomBytes(2).toString('hex')}`;
    const pRating = Math.max(48, Math.min(94, baseRating + ((idx * 7 + (p.age || 22)) % 9) - 4));

    const isNonRussian = p.nation && !p.nation.toLowerCase().includes('россия');
    const isDual = p.nation && (p.nation.includes(',') || p.nation.includes('/'));

    const otherNat = isNonRussian
      ? p.nation
      : isDual
      ? p.nation.replace(/россия/gi, '').replace(/[,/]/g, '').trim()
      : '';

    const born = p.born || (p.age ? `${2026 - p.age}-07-15` : '2002-05-15');

    const playerObj = {
      id: pid,
      teamId: tm.id,
      name: p.name,
      num: p.num ?? (idx + 1),
      number: p.num ?? (idx + 1),
      pos: p.pos,
      born,
      age: p.age || 23,
      nation: p.nation || 'Россия',
      playedForOtherNationalTeam: !!otherNat,
      otherNationalTeam: otherNat,
      realClub: tm.name,
      style: getPlayerStyle(p.pos, idx),
      rating: pRating,
      achievements: [
        `Воспитанник регионального футбола (${tm.city || 'Россия'})`,
        `Заявлен за ${tm.name} на сезон 2026/2027`,
      ],
      stats2y: `${25 + ((idx * 3) % 25)} матчей, ${(idx * 2) % 12} результативных действий`,
      form: 'В хорошей спортивной форме, тренируется с полной отдачей',
      character: 'Дисциплинированный командный игрок, мотивирован на победу',
      news: '',
      verified: true,
      updatedAt: new Date().toISOString(),
      out: null,
      banLeft: 0,
      seasonYC: 0,
    };

    newPlayers.push(playerObj);
    teamPlayerIds.push(pid);
  });

  newSquads[tm.id] = teamPlayerIds;

  // 2. Process coaching staff
  let headCoachFound = false;

  clubData.staff.forEach((st, idx) => {
    const sid = `st_${tm.id.slice(0, 6)}_${String(idx + 1).padStart(2, '0')}_${crypto.randomBytes(2).toString('hex')}`;
    const role = mapStaffRole(st.roleTitle);

    const styleChoice = COACH_STYLES[idx % COACH_STYLES.length];

    const staffObj = {
      id: sid,
      teamId: tm.id,
      teamName: tm.name,
      name: st.name,
      role,
      roleTitle: st.roleTitle,
      specialty: st.roleTitle,
      salary: role === 'head' ? 120000 : 50000,
      rating: role === 'head' ? baseRating + 5 : baseRating,
      reputation: role === 'head' ? 'Национальная' : 'Клубная',
      age: st.age || 45,
      nationality: st.nationality || 'Россия',
      brief: `${st.roleTitle} футбольного клуба ${tm.name}.`,
      bio: `${st.name} — ${st.roleTitle.toLowerCase()} в клубе «${tm.name}». Отвечает за профессиональную подготовку команды.`,
      favoriteFormation: styleChoice.form,
      style: styleChoice.style,
      styleTitle: styleChoice.title,
      pending: false,
    };

    newStaff.push(staffObj);

    if (role === 'head' && !headCoachFound) {
      headCoachFound = true;
      newCoaches[tm.id] = {
        id: sid,
        name: st.name,
        clubName: tm.name,
        comp: tm.comp,
        nationality: st.nationality || 'Россия',
        age: st.age || 48,
        style: styleChoice.style,
        styleTitle: styleChoice.title,
        styleDesc: `${st.name} руководит клубом «${tm.name}». Основной тактический почерк — ${styleChoice.title.toLowerCase()}.`,
        formation: styleChoice.form,
        favoriteFormation: styleChoice.form,
        reputation: baseRating + 5,
        temperament: 'Уравновешенный',
        quote: '«Дисциплина, характер и командная игра — залог успеха»',
      };
    }
  });

  // If no head coach was explicitly in staff (e.g. Media League clubs), ensure one exists
  if (!headCoachFound) {
    const defaultCoachName = `Тренер ${tm.name}`;
    const sid = `st_${tm.id.slice(0, 6)}_hd_${crypto.randomBytes(2).toString('hex')}`;
    const styleChoice = COACH_STYLES[0];
    const coachObj = {
      id: sid,
      teamId: tm.id,
      teamName: tm.name,
      name: defaultCoachName,
      role: 'head',
      roleTitle: 'Главный тренер',
      specialty: 'Главный тренер',
      salary: 80000,
      rating: baseRating + 2,
      reputation: 'Клубная',
      age: 46,
      nationality: 'Россия',
      brief: `Главный тренер ${tm.name}`,
      bio: `${defaultCoachName} — наставник клуба ${tm.name}.`,
      favoriteFormation: styleChoice.form,
      style: styleChoice.style,
      styleTitle: styleChoice.title,
      pending: false,
    };
    newStaff.push(coachObj);
    newCoaches[tm.id] = {
      id: sid,
      name: defaultCoachName,
      clubName: tm.name,
      comp: tm.comp,
      nationality: 'Россия',
      age: 46,
      style: styleChoice.style,
      styleTitle: styleChoice.title,
      styleDesc: `Главный тренер ${tm.name}.`,
      formation: styleChoice.form,
      favoriteFormation: styleChoice.form,
      reputation: baseRating + 2,
      temperament: 'Уравновешенный',
      quote: '«Главное — страсть к игре и полная самоотдача»',
    };
  }
}

// Any clubs in db.teams that weren't in files?
for (const tm of db.teams) {
  if (!processedTeamIds.has(tm.id)) {
    console.log(`Team ${tm.name} (${tm.id}) was not in files, checking...`);
  }
}

// Update DB
db.players = newPlayers;
db.staff = newStaff;
db.squads = newSquads;
db.coaches = newCoaches;
if (!db.settings) db.settings = {};
db.settings.squadMax = 45;
db._savedAt = new Date().toISOString();

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');

console.log('--- DATABASE LOADED SUCCESSFULLY ---');
console.log(`Total teams processed: ${processedTeamIds.size}`);
console.log(`Total players loaded: ${newPlayers.length}`);
console.log(`Total staff loaded: ${newStaff.length}`);
console.log(`Total coaches loaded: ${Object.keys(newCoaches).length}`);
console.log(`Total squads updated: ${Object.keys(newSquads).length}`);
