export interface UserData {
  email: string
  fullName: string
  initials: string
  role: 'Business' | 'Operations' | 'Staff'
  status: 'Active' | 'Invitation Pending' | 'Invitation Expired' | 'Blocked'
  lastLogin: string
  hasProfileImage: boolean
  statusSince: string
}

type UserDataInput = Omit<UserData, 'statusSince'>

function statusSinceFor(idx: number, status: UserData['status']): string {
  const baseDays = status === 'Active' ? 30 + ((idx * 17) % 540) : 1 + ((idx * 5) % 30)
  const d = new Date()
  d.setDate(d.getDate() - baseDays)
  d.setHours((idx * 7) % 24, (idx * 11) % 60, 0, 0)
  return d.toISOString()
}

function withStatusSince(arr: UserDataInput[]): UserData[] {
  return arr.map((u, i) => ({ ...u, statusSince: statusSinceFor(i, u.status) }))
}

const glsDeUsersInput: UserDataInput[] = [
  {
    email: 'eleonore.weiss@gls.de',
    fullName: 'Eleonore Weiss',
    initials: 'EW',
    role: 'Business',
    status: 'Active',
    lastLogin: 'Wed, 9.4.2025, 16:15 via SSO',
    hasProfileImage: true,
  },
  {
    email: 'klaus.thiel@gls.de',
    fullName: 'Klaus Thiel',
    initials: 'KT',
    role: 'Operations',
    status: 'Invitation Pending',
    lastLogin: '-',
    hasProfileImage: false,
  },
  {
    email: 'anneliese.sommer@gls.de',
    fullName: 'Anneliese Sommer',
    initials: 'AS',
    role: 'Staff',
    status: 'Invitation Expired',
    lastLogin: '-',
    hasProfileImage: false,
  },
  {
    email: 'jürgen.krause@gls.de',
    fullName: 'Jürgen Krause',
    initials: 'JK',
    role: 'Staff',
    status: 'Active',
    lastLogin: 'Thu, 22.05.2025, 21:30 via SSO',
    hasProfileImage: true,
  },
  {
    email: 'monika.werner@gls.de',
    fullName: 'Monika Werner',
    initials: 'MW',
    role: 'Staff',
    status: 'Active',
    lastLogin: 'Sat, 07.06.2025, 11:45 via SSO',
    hasProfileImage: false,
  },
  {
    email: 'hans-peter.kuhn@gls.de',
    fullName: 'Hans-Peter Kuhn',
    initials: 'HK',
    role: 'Staff',
    status: 'Active',
    lastLogin: 'Mon, 05.05.2025, 07:55 via SSO',
    hasProfileImage: false,
  },
  {
    email: 'ursula.winter@gls.de',
    fullName: 'Ursula Winter',
    initials: 'UW',
    role: 'Operations',
    status: 'Active',
    lastLogin: 'Sun, 06.07.2025, 14:25 via SSO',
    hasProfileImage: false,
  },
  {
    email: 'manfred.boehm@gls.de',
    fullName: 'Manfred Boehm',
    initials: 'MB',
    role: 'Staff',
    status: 'Active',
    lastLogin: 'Fri, 18.07.2025, 03:10 via E-Mail',
    hasProfileImage: false,
  },
  {
    email: 'gisela.franke@gls.de',
    fullName: 'Gisela Franke',
    initials: 'GF',
    role: 'Operations',
    status: 'Active',
    lastLogin: 'Wed, 23.07.2025, 18:45 via SSO',
    hasProfileImage: false,
  },
  {
    email: 'gerhard.maurer@gls.de',
    fullName: 'Gerhard Maurer',
    initials: 'GM',
    role: 'Staff',
    status: 'Blocked',
    lastLogin: 'Mon, 28.07.2025, 09:00 via SSO',
    hasProfileImage: false,
  },
]

export const userData: UserData[] = withStatusSince(glsDeUsersInput)

const dpdUsersInput: UserDataInput[] = [
  { email: 'stefan.braun@dpd.de', fullName: 'Stefan Braun', initials: 'SB', role: 'Business', status: 'Active', lastLogin: 'Mon, 14.04.2025, 09:00 via SSO', hasProfileImage: true },
  { email: 'petra.richter@dpd.de', fullName: 'Petra Richter', initials: 'PR', role: 'Operations', status: 'Active', lastLogin: 'Sun, 13.04.2025, 14:30 via SSO', hasProfileImage: false },
  { email: 'thomas.klein@dpd.de', fullName: 'Thomas Klein', initials: 'TK', role: 'Staff', status: 'Active', lastLogin: 'Fri, 11.04.2025, 16:20 via E-Mail', hasProfileImage: false },
  { email: 'andrea.wolf@dpd.de', fullName: 'Andrea Wolf', initials: 'AW', role: 'Staff', status: 'Invitation Pending', lastLogin: '-', hasProfileImage: false },
  { email: 'frank.meyer@dpd.de', fullName: 'Frank Meyer', initials: 'FM', role: 'Operations', status: 'Active', lastLogin: 'Thu, 10.04.2025, 11:15 via SSO', hasProfileImage: true },
  { email: 'sabine.hartmann@dpd.de', fullName: 'Sabine Hartmann', initials: 'SH', role: 'Staff', status: 'Active', lastLogin: 'Wed, 09.04.2025, 08:45 via SSO', hasProfileImage: false },
  { email: 'michael.bauer@dpd.de', fullName: 'Michael Bauer', initials: 'MB', role: 'Staff', status: 'Blocked', lastLogin: 'Mon, 07.04.2025, 12:00 via SSO', hasProfileImage: false },
]
const dpdUsers = withStatusSince(dpdUsersInput)

const glsAtUsersInput: UserDataInput[] = [
  { email: 'markus.huber@gls-austria.at', fullName: 'Markus Huber', initials: 'MH', role: 'Business', status: 'Active', lastLogin: 'Mon, 14.04.2025, 10:30 via SSO', hasProfileImage: true },
  { email: 'elisabeth.gruber@gls-austria.at', fullName: 'Elisabeth Gruber', initials: 'EG', role: 'Operations', status: 'Active', lastLogin: 'Sat, 12.04.2025, 15:00 via SSO', hasProfileImage: false },
  { email: 'wolfgang.wagner@gls-austria.at', fullName: 'Wolfgang Wagner', initials: 'WW', role: 'Staff', status: 'Active', lastLogin: 'Fri, 11.04.2025, 09:20 via E-Mail', hasProfileImage: false },
  { email: 'maria.pichler@gls-austria.at', fullName: 'Maria Pichler', initials: 'MP', role: 'Staff', status: 'Invitation Expired', lastLogin: '-', hasProfileImage: false },
  { email: 'josef.steiner@gls-austria.at', fullName: 'Josef Steiner', initials: 'JS', role: 'Operations', status: 'Active', lastLogin: 'Wed, 09.04.2025, 13:40 via SSO', hasProfileImage: false },
]
const glsAtUsers = withStatusSince(glsAtUsersInput)

const glsItUsersInput: UserDataInput[] = [
  { email: 'marco.rossi@gls-italy.it', fullName: 'Marco Rossi', initials: 'MR', role: 'Business', status: 'Active', lastLogin: 'Mon, 14.04.2025, 08:15 via SSO', hasProfileImage: true },
  { email: 'giulia.bianchi@gls-italy.it', fullName: 'Giulia Bianchi', initials: 'GB', role: 'Operations', status: 'Active', lastLogin: 'Sun, 13.04.2025, 17:00 via SSO', hasProfileImage: false },
  { email: 'luca.ferrari@gls-italy.it', fullName: 'Luca Ferrari', initials: 'LF', role: 'Staff', status: 'Active', lastLogin: 'Sat, 12.04.2025, 11:30 via SSO', hasProfileImage: false },
  { email: 'francesca.romano@gls-italy.it', fullName: 'Francesca Romano', initials: 'FR', role: 'Staff', status: 'Invitation Pending', lastLogin: '-', hasProfileImage: false },
  { email: 'alessandro.colombo@gls-italy.it', fullName: 'Alessandro Colombo', initials: 'AC', role: 'Operations', status: 'Active', lastLogin: 'Thu, 10.04.2025, 14:50 via E-Mail', hasProfileImage: true },
  { email: 'chiara.ricci@gls-italy.it', fullName: 'Chiara Ricci', initials: 'CR', role: 'Staff', status: 'Active', lastLogin: 'Wed, 09.04.2025, 10:00 via SSO', hasProfileImage: false },
  { email: 'giovanni.marino@gls-italy.it', fullName: 'Giovanni Marino', initials: 'GM', role: 'Staff', status: 'Active', lastLogin: 'Mon, 07.04.2025, 16:25 via SSO', hasProfileImage: false },
  { email: 'sofia.greco@gls-italy.it', fullName: 'Sofia Greco', initials: 'SG', role: 'Staff', status: 'Blocked', lastLogin: 'Fri, 04.04.2025, 09:00 via SSO', hasProfileImage: false },
]
const glsItUsers = withStatusSince(glsItUsersInput)

const glsEsUsersInput: UserDataInput[] = [
  { email: 'carlos.garcia@gls-spain.es', fullName: 'Carlos García', initials: 'CG', role: 'Business', status: 'Active', lastLogin: 'Mon, 14.04.2025, 09:45 via SSO', hasProfileImage: true },
  { email: 'lucia.fernandez@gls-spain.es', fullName: 'Lucía Fernández', initials: 'LF', role: 'Operations', status: 'Active', lastLogin: 'Sun, 13.04.2025, 16:20 via SSO', hasProfileImage: false },
  { email: 'javier.lopez@gls-spain.es', fullName: 'Javier López', initials: 'JL', role: 'Staff', status: 'Active', lastLogin: 'Sat, 12.04.2025, 12:10 via SSO', hasProfileImage: false },
  { email: 'maria.martinez@gls-spain.es', fullName: 'María Martínez', initials: 'MM', role: 'Staff', status: 'Invitation Pending', lastLogin: '-', hasProfileImage: false },
  { email: 'antonio.sanchez@gls-spain.es', fullName: 'Antonio Sánchez', initials: 'AS', role: 'Operations', status: 'Active', lastLogin: 'Thu, 10.04.2025, 14:00 via E-Mail', hasProfileImage: true },
  { email: 'elena.ruiz@gls-spain.es', fullName: 'Elena Ruiz', initials: 'ER', role: 'Staff', status: 'Active', lastLogin: 'Wed, 09.04.2025, 10:35 via SSO', hasProfileImage: false },
  { email: 'pablo.diaz@gls-spain.es', fullName: 'Pablo Díaz', initials: 'PD', role: 'Staff', status: 'Active', lastLogin: 'Mon, 07.04.2025, 17:50 via SSO', hasProfileImage: false },
]
const glsEsUsers = withStatusSince(glsEsUsersInput)

const glsPtUsersInput: UserDataInput[] = [
  { email: 'joao.silva@gls-portugal.pt', fullName: 'João Silva', initials: 'JS', role: 'Business', status: 'Active', lastLogin: 'Mon, 14.04.2025, 10:00 via SSO', hasProfileImage: true },
  { email: 'ana.santos@gls-portugal.pt', fullName: 'Ana Santos', initials: 'AS', role: 'Operations', status: 'Active', lastLogin: 'Sun, 13.04.2025, 18:15 via SSO', hasProfileImage: false },
  { email: 'pedro.ferreira@gls-portugal.pt', fullName: 'Pedro Ferreira', initials: 'PF', role: 'Staff', status: 'Active', lastLogin: 'Sat, 12.04.2025, 13:25 via SSO', hasProfileImage: false },
  { email: 'rita.pereira@gls-portugal.pt', fullName: 'Rita Pereira', initials: 'RP', role: 'Staff', status: 'Invitation Expired', lastLogin: '-', hasProfileImage: false },
  { email: 'tiago.costa@gls-portugal.pt', fullName: 'Tiago Costa', initials: 'TC', role: 'Operations', status: 'Active', lastLogin: 'Thu, 10.04.2025, 15:30 via E-Mail', hasProfileImage: true },
  { email: 'marta.oliveira@gls-portugal.pt', fullName: 'Marta Oliveira', initials: 'MO', role: 'Staff', status: 'Active', lastLogin: 'Wed, 09.04.2025, 11:50 via SSO', hasProfileImage: false },
]
const glsPtUsers = withStatusSince(glsPtUsersInput)

const userDataByCarrier: Record<string, UserData[]> = {
  'gls-de': userData,
  'dpd-de': dpdUsers,
  'gls-at': glsAtUsers,
  'gls-it': glsItUsers,
  'gls-es': glsEsUsers,
  'gls-pt': glsPtUsers,
}

export function getUserDataForCarrier(carrierId: string): UserData[] {
  return userDataByCarrier[carrierId] ?? userData
}
