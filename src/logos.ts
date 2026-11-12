// @ts-nocheck
/**
 * Logos and color utilities for RPL teams and tournaments
 */

export const OFFICIAL_SERVER_LOGOS: Record<string, string> = {
  'зенит': '/assets/aistudio/russia_zenit.football-logos.cc_c93ec0ee.svg',
  'спартак': '/assets/aistudio/russia_spartak-moskva.football-logos.cc_cd7a4eb7.svg',
  'цска': '/assets/aistudio/PFC_CSKA_9a6b044d.svg',
  'локомотив': '/assets/aistudio/russia_lokomotiv-moskva.football-logos.cc_af3d5476.svg',
  'динамо москва': '/assets/aistudio/russia_dynamo-moscow.football-logos.cc_00d01b39.svg',
  'краснодар': '/assets/aistudio/russia_krasnodar.football-logos.cc_3eb2641e.svg',
  'ростов': '/assets/aistudio/russia_rostov.football-logos.cc_615b1535.svg',
  'рубин': '/assets/aistudio/russia_rubin.football-logos.cc_f471fd8f.svg',
  'крылья советов': '/assets/aistudio/russia_krylya-sovetov.football-logos.cc_1b424814.svg',
  'ахмат': '/assets/aistudio/russia_akhmat.football-logos.cc_ec510264.svg',
  'балтика': '/assets/aistudio/russia_baltika.football-logos.cc_dec89199.svg',
  'сочи': '/assets/aistudio/russia_sochi.football-logos.cc_368db1f4.svg',
  'пари нн': '/assets/aistudio/russia_pari-nn.football-logos.cc_3e0b1012.svg',
  'оренбург': '/assets/aistudio/russia_orenburg.football-logos.cc_e7d8ed34.svg',
  'акрон': '/assets/aistudio/russia_akron.football-logos.cc_9b564896.svg',
  'динамо махачкала': '/assets/aistudio/russia_dynamo-makhachkala.football-logos.cc_9e55fd99.svg',
  'факел': '/assets/aistudio/russia_fakel.football-logos.cc_4beaea45.svg',
  'урал': '/assets/aistudio/russia_ural.football-logos.cc_d02d7659.svg',
  'торпедо': '/assets/aistudio/russia_torpedo-moskva.football-logos.cc_458824bb.svg',
  'шинник': '/assets/aistudio/russia_shinnik.football-logos.cc_b0a4c239.svg',
  'арсенал': '/assets/aistudio/russia_arsenal-tula.football-logos.cc_1ce7619a.svg',
  'ротор': '/assets/aistudio/russia_rotor.football-logos.cc_be212968.svg',
  'родина': '/assets/aistudio/russia_rodina-moscow.football-logos.cc_9872b082.svg',
  'камаз': '/assets/aistudio/russia_kamaz.football-logos.cc_5f0e30b1.svg',
  'черноморец': '/assets/aistudio/russia_chernomorets-novorossiisk.football-logos.cc_69abc7dc.svg',
  'ска-хабаровск': '/assets/aistudio/russia_ska-khabarovsk.football-logos.cc_5d23a258.svg',
  'енисей': '/assets/aistudio/russia_yenisey.football-logos.cc_277f7baf.svg',
  'уфа': '/assets/aistudio/russia_ufa.football-logos.cc_b2df7253.svg',
  'нефтехимик': '/assets/aistudio/russia_neftekhimik-nizhnekamsk.football-logos.cc_7baec74c.svg',
  'чайка': '/assets/aistudio/russia_chayka-peschanokopskoye.football-logos.cc_a336e808.svg',
  'сокол': '/assets/aistudio/russia_fc-sokol-saratov.football-logos.cc_340b39fc.svg',
  'амкар': '/assets/aistudio/russia_amkar.football-logos.cc_64e4152c.svg',
  'алания': '/assets/aistudio/alania-big_ca72efaa.png',
  'амкал': '/assets/aistudio/amkal-big_9fc643af.png',
  '2drots': '/assets/aistudio/2drots-big-768x768_24a6f01f.png',
  'броуки': '/assets/aistudio/Brokeboys_lightmode_4834bb47.png',
  'сборная россии': '/assets/aistudio/russia_russia-national-team.football-logos.cc_2a5e3ddc.svg',
  'сборная': '/assets/aistudio/russia_russia-national-team.football-logos.cc_2a5e3ddc.svg'
};

export const COMPETITION_LOGOS: Record<string, string> = {
  rpl: '/logos/leagues/rpl.svg',
  supercup: '/logos/leagues/supercup.svg',
  fnl: '/logos/leagues/fnl.svg',
  cup: '/logos/leagues/cup.svg',
  '2la': '/logos/leagues/2la.svg',
  '2lb': '/logos/leagues/2lb.svg',
  media: '/logos/leagues/media.svg',
  russia: '/assets/aistudio/russia_russia-national-team.football-logos.cc_2a5e3ddc.svg'
};

export function getTeamLogo(name: string, customLogo?: string | null, comp?: string): string {
  if (customLogo && customLogo.trim()) return customLogo.trim();
  if (!name) return '';
  const key = String(name).trim().toLowerCase();
  for (const [k, v] of Object.entries(OFFICIAL_SERVER_LOGOS)) {
    if (key === k || key.includes(k) || k.includes(key)) return v;
  }
  return '';
}

export function getCompetitionLogo(comp: string): string {
  if (!comp) return COMPETITION_LOGOS.rpl;
  const k = String(comp).toLowerCase().trim();
  return COMPETITION_LOGOS[k] || COMPETITION_LOGOS.rpl;
}

export function getTeamColors(teamName: string): { primary: string; secondary: string } {
  const nm = String(teamName || '').toLowerCase();
  if (nm.includes('зенит')) return { primary: '#1e88e5', secondary: '#ffffff' };
  if (nm.includes('спартак')) return { primary: '#e53935', secondary: '#ffffff' };
  if (nm.includes('цска')) return { primary: '#c62828', secondary: '#1565c0' };
  if (nm.includes('локомотив')) return { primary: '#2e7d32', secondary: '#c62828' };
  if (nm.includes('динамо')) return { primary: '#1976d2', secondary: '#ffffff' };
  if (nm.includes('краснодар')) return { primary: '#1b5e20', secondary: '#000000' };
  if (nm.includes('ростов')) return { primary: '#fbc02d', secondary: '#0d47a1' };
  if (nm.includes('рубин')) return { primary: '#b71c1c', secondary: '#2e7d32' };
  if (nm.includes('крылья')) return { primary: '#42a5f5', secondary: '#ffffff' };
  if (nm.includes('ахмат')) return { primary: '#2e7d32', secondary: '#ffffff' };
  if (nm.includes('сочи')) return { primary: '#0288d1', secondary: '#ffffff' };
  if (nm.includes('пари')) return { primary: '#1565c0', secondary: '#00bcd4' };
  if (nm.includes('балтика')) return { primary: '#0d47a1', secondary: '#ffffff' };
  if (nm.includes('оренбург')) return { primary: '#1565c0', secondary: '#ffffff' };
  if (nm.includes('акрон')) return { primary: '#d32f2f', secondary: '#000000' };
  if (nm.includes('факел')) return { primary: '#1565c0', secondary: '#ffffff' };
  return { primary: '#334155', secondary: '#94a3b8' };
}
