import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const workshops = [
  { id: "it", name: "المعلوميات", icon: "💻" },
  { id: "accounting", name: "المحاسبة", icon: "📊" },
  { id: "labor-law", name: "قانون الشغل", icon: "⚖️" },
  { id: "tailoring", name: "الخياطة التقليدية", icon: "🧵" },
];

// Real data from CSV - each entry: [num, name, dob, cin, gender, phone, address, specialization]
const students: Array<{
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date | null;
  phone: string | null;
  address: string | null;
  specialization: string;
  cohort: number;
}> = [
  { registrationNo: "BD-2026-001", firstName: "CHAIMA", lastName: "EL ALEM", gender: "F", dateOfBirth: new Date("1998-05-11"), phone: "715916838", address: "HAY ZLOUAHDA TOURABIA RUE TOUGDAM", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-002", firstName: "ELLAYE", lastName: "BABI", gender: "F", dateOfBirth: new Date("1999-05-24"), phone: "637773103", address: "HAY ZLOUAHDA TOURABIA RUE TOUGDAM", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-003", firstName: "ACHBANI", lastName: "OUMAIMA", gender: "F", dateOfBirth: new Date("2008-06-01"), phone: "681331917", address: "HAY ESSALAM", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-004", firstName: "KAOUTAR", lastName: "MOTAOUAKIL", gender: "F", dateOfBirth: new Date("2005-04-15"), phone: "633961836", address: "HAY ESSALAM", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-005", firstName: "AYA", lastName: "LAABAD", gender: "F", dateOfBirth: new Date("2004-04-09"), phone: "620166888", address: "HAY ELAMANE 2", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-006", firstName: "LATIFA", lastName: "ABBAR", gender: "F", dateOfBirth: new Date("1997-07-26"), phone: null, address: "HAY ELAMANE 2", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-007", firstName: "HASNA", lastName: "HSSAINE", gender: "F", dateOfBirth: new Date("2000-06-09"), phone: "768044917", address: "HAY ELOUHDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-008", firstName: "NAJIA", lastName: "AIT BOUZID", gender: "F", dateOfBirth: new Date("1999-03-01"), phone: "709353735", address: "HAY ELOUAHDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-009", firstName: "KHIRA", lastName: "ZINEB", gender: "F", dateOfBirth: new Date("1997-02-01"), phone: "671503382", address: "HAY ENNAHDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-010", firstName: "AMANE", lastName: "MARZOUK", gender: "F", dateOfBirth: new Date("1996-01-01"), phone: "643292333", address: "HAY ALAL BEN ABDELAH", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-011", firstName: "FARHAT", lastName: "NOUHAILA", gender: "F", dateOfBirth: new Date("1999-07-15"), phone: "674592425", address: "HAY ELOUAHDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-012", firstName: "ZINEB", lastName: "ESSAMI", gender: "F", dateOfBirth: new Date("2005-01-02"), phone: "721756456", address: "****", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-013", firstName: "AMAL", lastName: "EL KOULI", gender: "F", dateOfBirth: new Date("1996-11-17"), phone: "762840432", address: "LOT ELOUAHDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-014", firstName: "FATIMA EZZAHRA", lastName: "SAIF EDDINE", gender: "F", dateOfBirth: new Date("2005-07-13"), phone: "720340442", address: "HAY ELAMANE 2", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-015", firstName: "AINANA", lastName: "NOURA", gender: "F", dateOfBirth: new Date("2001-07-11"), phone: null, address: "HAY ELKHAIR2", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-016", firstName: "NOURA", lastName: "HAMMIA", gender: "F", dateOfBirth: new Date("1994-11-01"), phone: null, address: "HAY ELOUHDA TOURABIA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-017", firstName: "ABLA", lastName: "ELBAHTARI", gender: "F", dateOfBirth: new Date("2009-10-12"), phone: "654185088", address: "HAY ETANMIA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-018", firstName: "ZAHRA", lastName: "BOUHALI", gender: "F", dateOfBirth: new Date("1997-06-11"), phone: "679624112", address: "HAY ESALAM", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-019", firstName: "ZAHRA", lastName: "BRY", gender: "F", dateOfBirth: new Date("2000-05-22"), phone: "642938764", address: "HAY EL AMAL", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-020", firstName: "ILHAM", lastName: "ESSAKHAR", gender: "F", dateOfBirth: new Date("1997-11-21"), phone: "697914898", address: "RV ELMARHOUM BABI", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-021", firstName: "BOUCHRA", lastName: "ECH CHABANY", gender: "F", dateOfBirth: new Date("2002-08-10"), phone: "713778216", address: "HAY ELAMAL", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-022", firstName: "LAMYAE", lastName: "AALIOUA", gender: "F", dateOfBirth: new Date("2006-06-16"), phone: "621325864", address: "HAY ELAOUDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-023", firstName: "HALIMA", lastName: "FARRAH", gender: "F", dateOfBirth: new Date("1999-03-10"), phone: "714849616", address: "HAY MLY ABDELAH", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-024", firstName: "FATIMA EZZAHRA", lastName: "FARRAH", gender: "F", dateOfBirth: new Date("1996-03-02"), phone: "648139677", address: "HAY MLY ABDELAH", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-025", firstName: "SIHAM", lastName: "ELMAROUF", gender: "F", dateOfBirth: new Date("2002-07-21"), phone: "635798128", address: "HAY ENNAHDA", specialization: "textile", cohort: 1 },
  { registrationNo: "BD-2026-026", firstName: "HANAN", lastName: "BOUCHOUA", gender: "F", dateOfBirth: new Date("1997-04-03"), phone: "771535232", address: "HAY ENNAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-027", firstName: "ZINEB", lastName: "LAHMINI", gender: "F", dateOfBirth: new Date("2004-08-22"), phone: "762243208", address: "HAY ALAL BEN ABDELLAH", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-028", firstName: "SALMA", lastName: "LAARAICH", gender: "F", dateOfBirth: new Date("2003-12-22"), phone: null, address: "HAY ELKHAIR", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-029", firstName: "LOUBNA", lastName: "OUAHBI", gender: "F", dateOfBirth: new Date("2005-12-09"), phone: "698338707", address: "HAY ELOUAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-030", firstName: "FARAH", lastName: "AHLAM", gender: "F", dateOfBirth: null, phone: "720499096", address: "HAY ELAMAN", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-031", firstName: "HABIBA", lastName: "MERBAH", gender: "F", dateOfBirth: new Date("1996-11-27"), phone: "636023984", address: "HAY ELOUAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-032", firstName: "MBARKA", lastName: "ANSIR", gender: "F", dateOfBirth: new Date("2001-09-13"), phone: null, address: "HAY ELAMANE 2", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-033", firstName: "HASNA", lastName: "ANCIR", gender: "F", dateOfBirth: new Date("2005-12-08"), phone: null, address: "HAY ELAMANE 2", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-034", firstName: "MONA", lastName: "AMIR", gender: "F", dateOfBirth: new Date("2003-12-18"), phone: "702658803", address: "HAY ALAL BEN ABDELAH", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-035", firstName: "HASNA", lastName: "AIT HMED", gender: "F", dateOfBirth: new Date("2003-03-31"), phone: "764880643", address: "HAY ENNOUR", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-036", firstName: "LATIFA", lastName: "NTIT", gender: "F", dateOfBirth: new Date("2002-12-20"), phone: "726075498", address: "HAY ELOUAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-037", firstName: "LAARAG", lastName: "AICHA", gender: "F", dateOfBirth: new Date("2006-04-25"), phone: "672435409", address: "HAY ALAL BEN ABDELAH", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-038", firstName: "IBN OMAR", lastName: "SAMIRA", gender: "F", dateOfBirth: new Date("2010-11-06"), phone: "720484113", address: "HAY ELAMAN2", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-039", firstName: "EL YESSEFY", lastName: "FATIHA", gender: "F", dateOfBirth: new Date("2007-10-20"), phone: null, address: "HAY ELAMAN2", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-040", firstName: "ER RAIY", lastName: "WIDAD", gender: "F", dateOfBirth: new Date("2004-12-22"), phone: null, address: "HAY ELAMAN", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-041", firstName: "BELASRI", lastName: "HASNAE", gender: "F", dateOfBirth: new Date("2010-05-01"), phone: "710524772", address: "HAY ELKHAIR", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-042", firstName: "NASIRA", lastName: "FATIN", gender: "F", dateOfBirth: new Date("2008-07-15"), phone: "636618925", address: "HAY ELAMAN1", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-043", firstName: "SOUKAINA", lastName: "KADOUANI", gender: "F", dateOfBirth: new Date("2008-07-09"), phone: "713906894", address: "HAY ELAMAN2", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-044", firstName: "FARIDA", lastName: "FAHIM", gender: "F", dateOfBirth: new Date("2000-03-02"), phone: "681667835", address: "HAY ENNAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-045", firstName: "MANINE", lastName: "SAMMAD", gender: "F", dateOfBirth: new Date("2000-04-21"), phone: "712520584", address: "HAY ENNAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-046", firstName: "EL BAZ", lastName: "HIBA", gender: "F", dateOfBirth: new Date("2008-07-14"), phone: "696926908", address: "HAY ELOUAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-047", firstName: "MONA", lastName: "ELBOUKHARI", gender: "F", dateOfBirth: new Date("1996-07-27"), phone: "615591275", address: "HAY ELAOUDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-048", firstName: "KHADIJA", lastName: "OUMOUILID", gender: "F", dateOfBirth: new Date("2006-08-01"), phone: "706874429", address: "LOT ELOUAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-049", firstName: "NAIMA", lastName: "OUMOULID", gender: "F", dateOfBirth: new Date("2001-04-24"), phone: "637872090", address: "HAY ELOUAHDA", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-050", firstName: "IKRAM", lastName: "ELKIHAL", gender: "F", dateOfBirth: new Date("2004-05-28"), phone: "764526694", address: "HAY ELAMAN", specialization: "textile", cohort: 2 },
  { registrationNo: "BD-2026-051", firstName: "NISRINE", lastName: "BOUSLAMA", gender: "F", dateOfBirth: new Date("2006-09-18"), phone: "705063649", address: "HAY ELAMAN", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-052", firstName: "LHANSALI", lastName: "IBTISAM", gender: "F", dateOfBirth: new Date("2002-09-11"), phone: "671267967", address: "LOT ELOUAHDA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-053", firstName: "SAFA", lastName: "ELBAHLAOUI", gender: "F", dateOfBirth: new Date("2003-07-19"), phone: "608070778", address: "HAY ELAMAN 1", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-054", firstName: "ZINEB", lastName: "BOUJAIDA", gender: "F", dateOfBirth: new Date("2007-09-18"), phone: "603727197", address: "HAY ETANMIA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-055", firstName: "AOUATIF", lastName: "BOUZIDI", gender: "F", dateOfBirth: new Date("1997-03-03"), phone: "626577879", address: "HAY ELOUAHDA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-056", firstName: "ASMAE", lastName: "EL HAFDY", gender: "F", dateOfBirth: new Date("2003-05-02"), phone: "676236894", address: "HAY ELAMAN 1", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-057", firstName: "MBARKA", lastName: "ALIOUAT", gender: "F", dateOfBirth: new Date("1998-07-01"), phone: "714917889", address: "HAY EINBIAT", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-058", firstName: "BAHIA", lastName: "INTISSAR", gender: "F", dateOfBirth: new Date("2006-02-02"), phone: "723804685", address: "HAY ELAOUDA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-059", firstName: "ENNOURI", lastName: "KHADIJA", gender: "F", dateOfBirth: new Date("2008-04-19"), phone: "620834329", address: "HAY ELKHAIR", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-060", firstName: "SOUKAINA", lastName: "OUFRIT", gender: "F", dateOfBirth: new Date("1997-09-21"), phone: "608580048", address: "HAY ETANMIA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-061", firstName: "RABAB", lastName: "EDDALAOUI", gender: "F", dateOfBirth: new Date("1998-03-22"), phone: "767487833", address: "HAY ETANMIA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-062", firstName: "KHADIJA", lastName: "LABRINI", gender: "F", dateOfBirth: new Date("2001-09-29"), phone: "702658803", address: "HAY ALAL BEN ABDELAH", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-063", firstName: "HAKIMA", lastName: "ELAMRI", gender: "F", dateOfBirth: new Date("1997-11-26"), phone: "716247697", address: "HAY ALAL BEN ABDELAH", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-064", firstName: "JIHANE", lastName: "MAZLI", gender: "F", dateOfBirth: new Date("1997-08-06"), phone: "630735030", address: "HAY ELOUAHDA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-065", firstName: "OLAYA", lastName: "JDAY", gender: "F", dateOfBirth: new Date("2004-09-06"), phone: "658420218", address: "HAY ELKHAIR", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-066", firstName: "OUMAIMA", lastName: "JDAY", gender: "F", dateOfBirth: new Date("1997-07-13"), phone: "658420218", address: "HAY ELKHAIR", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-067", firstName: "ZAYYAD", lastName: "CHAIMA", gender: "F", dateOfBirth: new Date("2005-09-03"), phone: null, address: "HAY ESALAM", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-068", firstName: "NADIA", lastName: "ELMOUTAOUAKIL", gender: "F", dateOfBirth: new Date("1996-11-15"), phone: null, address: "HAY ESALAM", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-069", firstName: "HAYAT", lastName: "HOUJAIB", gender: "F", dateOfBirth: new Date("2000-06-26"), phone: null, address: "HAY ESALAM", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-070", firstName: "LOUANI", lastName: "HASNA", gender: "F", dateOfBirth: new Date("2003-04-06"), phone: null, address: "HAY ESALAM", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-071", firstName: "NAIGEA", lastName: "FATAT", gender: "F", dateOfBirth: new Date("2000-05-01"), phone: "715212700", address: "HAY ELMASIRA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-072", firstName: "SALKA", lastName: "CHAREF", gender: "F", dateOfBirth: new Date("2001-10-29"), phone: "703263317", address: "HAY ZLIDARI", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-073", firstName: "NEZHA", lastName: "BENHADDOU", gender: "F", dateOfBirth: new Date("2001-05-10"), phone: "627460256", address: "HAY ELAMAN1", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-074", firstName: "OUMAIMA", lastName: "AOUITER", gender: "F", dateOfBirth: new Date("1997-07-11"), phone: null, address: "HAY ETANMIA", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-075", firstName: "HASNA", lastName: "MERTAH", gender: "F", dateOfBirth: new Date("1996-01-29"), phone: "628561290", address: "HAY LALA MARIAM", specialization: "textile", cohort: 3 },
  { registrationNo: "BD-2026-076", firstName: "BOUCHRA", lastName: "BOUCHCOU", gender: "F", dateOfBirth: new Date("1997-01-20"), phone: "628561290", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-077", firstName: "KHADIJA", lastName: "LAHMINI", gender: "F", dateOfBirth: new Date("2007-06-12"), phone: null, address: "HAY ALAL BEN ABDELAH", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-078", firstName: "KHAOULA", lastName: "EL HILALI", gender: "F", dateOfBirth: new Date("1998-07-23"), phone: "670475675", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-079", firstName: "OUFAE", lastName: "LAARAICH", gender: "F", dateOfBirth: new Date("2000-10-18"), phone: null, address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-080", firstName: "HIND", lastName: "DADDA", gender: "F", dateOfBirth: new Date("2002-11-15"), phone: "767846626", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-081", firstName: "TIFAF", lastName: "ABDESSAMAD", gender: "F", dateOfBirth: new Date("2009-04-13"), phone: null, address: "HAY ENNAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-082", firstName: "KHADIJA", lastName: "KHARBOUCHE", gender: "F", dateOfBirth: new Date("2002-10-12"), phone: "712599241", address: "HAY ESALAM", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-083", firstName: "LAKHLIFI", lastName: "AICHA", gender: "F", dateOfBirth: new Date("1997-08-28"), phone: "636427958", address: "HAY ALAL BEN ABDELAH BOUJDOUR", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-084", firstName: "IBTISSAM", lastName: "ELHILALI", gender: "F", dateOfBirth: new Date("2000-05-25"), phone: "668940993", address: "HAY ELAMAN2", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-085", firstName: "KARIMA", lastName: "ECHAROUATI", gender: "F", dateOfBirth: new Date("1996-03-28"), phone: null, address: "HAY ETANMIA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-086", firstName: "FATMA", lastName: "ZAHID", gender: "F", dateOfBirth: new Date("2002-03-14"), phone: "651842359", address: "HAY ELAMAN", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-087", firstName: "ILHAM", lastName: "ENNAIME", gender: "F", dateOfBirth: new Date("2009-07-10"), phone: "607339727", address: "HAY ELAMAN", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-088", firstName: "MARIAM", lastName: "SANDAL", gender: "F", dateOfBirth: new Date("1995-12-16"), phone: "62608791", address: "HAY ELAMAN", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-089", firstName: "FATIMA EZZAHRA", lastName: "GRAICH", gender: "F", dateOfBirth: new Date("2003-06-01"), phone: null, address: "HAY ELAMAN", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-090", firstName: "KHADIJA", lastName: "QADAH", gender: "F", dateOfBirth: new Date("1997-06-13"), phone: "601536719", address: "HAY ELAOUDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-091", firstName: "LAILA", lastName: "HANNOUN", gender: "F", dateOfBirth: new Date("2000-01-24"), phone: "670269653", address: "HAY ELAOUDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-092", firstName: "NORA", lastName: "BENZAIMA", gender: "F", dateOfBirth: new Date("2006-10-27"), phone: "708696514", address: "HAY ESALAM", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-093", firstName: "ELAMRY", lastName: "MARIAM", gender: "F", dateOfBirth: new Date("2004-09-20"), phone: "69873774", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-094", firstName: "AHLAM", lastName: "ELOUAD", gender: "F", dateOfBirth: new Date("2005-09-13"), phone: "638701759", address: "HAY ESALAM", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-095", firstName: "ELOUD", lastName: "NASIMA", gender: "F", dateOfBirth: new Date("2005-10-02"), phone: "711337838", address: "HAY MLY RACHID", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-096", firstName: "MARYEM", lastName: "MABOUT", gender: "F", dateOfBirth: new Date("2026-02-14"), phone: "632647800", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-097", firstName: "AZOURZ", lastName: "HIND", gender: "F", dateOfBirth: new Date("2003-07-22"), phone: null, address: "HAY ESALAM", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-098", firstName: "GHIZLANE", lastName: "OUAYI", gender: "F", dateOfBirth: new Date("1999-12-06"), phone: null, address: "HAY ETANMIA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-099", firstName: "ERRADI", lastName: "ILHAM", gender: "F", dateOfBirth: null, phone: "770378938", address: "HAY ETANMIA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-100", firstName: "FATIMA EZZAHRA", lastName: "MIFTAH", gender: "F", dateOfBirth: new Date("1997-10-23"), phone: null, address: "LOT ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-101", firstName: "SOUKAINA", lastName: "ABATOURAB", gender: "F", dateOfBirth: new Date("2005-04-22"), phone: "626562235", address: "HAY ELHACEN BEN LMEHDI", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-102", firstName: "FATIMA", lastName: "LMOUADEN", gender: "F", dateOfBirth: new Date("2003-08-30"), phone: "773253923", address: "HAY ELOUAHDA ETOURABIA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-103", firstName: "SAADIA", lastName: "ABOUTARQANE", gender: "F", dateOfBirth: new Date("1996-11-01"), phone: "705074014", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-104", firstName: "KHAAOULA", lastName: "ELBIDA", gender: "F", dateOfBirth: new Date("2003-09-06"), phone: "7191489977", address: "HAY ELOUAHDA", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-105", firstName: "BABI", lastName: "NAJLA", gender: "F", dateOfBirth: new Date("2005-05-05"), phone: null, address: "HAY ENOUR", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-106", firstName: "HAIMMAD", lastName: "ELHAJJA", gender: "F", dateOfBirth: new Date("2003-10-21"), phone: "601020114", address: "HAY OUM LAMHAR", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-107", firstName: "HAJAR", lastName: "GATTIOUI", gender: "F", dateOfBirth: new Date("2001-04-30"), phone: "646687767", address: "HAY EMLKHAIR", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-108", firstName: "FARAH", lastName: "AHRIR", gender: "F", dateOfBirth: new Date("1996-02-02"), phone: "704347446", address: "HAY MATALAH", specialization: "textile", cohort: 4 },
  { registrationNo: "BD-2026-109", firstName: "BOUMAHDI", lastName: "TASSABIH", gender: "F", dateOfBirth: new Date("2010-07-01"), phone: "620269965", address: "HAY MLY ELHASAN BENLMEHDI", specialization: "cuir", cohort: 4 },
  { registrationNo: "BD-2026-110", firstName: "NOUHAILA", lastName: "SANKOU", gender: "F", dateOfBirth: new Date("2003-06-16"), phone: "627772468", address: "HAY MLY ELHASAN BENLMEHDI", specialization: "cuir", cohort: 4 },
  { registrationNo: "BD-2026-111", firstName: "YARA", lastName: "KHADIJA", gender: "F", dateOfBirth: new Date("2003-02-28"), phone: "678710238", address: "ENSEMBLE ARTISANAL DE BOUJDOUR", specialization: "cuir", cohort: 4 },
  { registrationNo: "BD-2026-112", firstName: "AADNANE", lastName: "DAGHMANI", gender: "M", dateOfBirth: new Date("2000-06-20"), phone: "670920582", address: "ENSEMBLE ARTISANAL DE BOUJDOUR", specialization: "cuir", cohort: 4 },
  { registrationNo: "BD-2026-113", firstName: "YARA", lastName: "ALI", gender: "M", dateOfBirth: new Date("2002-12-20"), phone: "670920582", address: "ENSEMBLE ARTISANAL DE BOUJDOUR", specialization: "cuir", cohort: 4 },
];

const defaultSettings = [
  { key: "centerName", value: "طلبة التدرج المهني", category: "center" },
  { key: "centerLocation", value: "بوجدور", category: "center" },
  { key: "academicYear", value: "2025-2026", category: "center" },
  { key: "registrationPrefix", value: "BD-2026", category: "center" },
  { key: "workshop1Name", value: "المعلوميات", category: "workshop" },
  { key: "workshop1Icon", value: "💻", category: "workshop" },
  { key: "workshop2Name", value: "المحاسبة", category: "workshop" },
  { key: "workshop2Icon", value: "📊", category: "workshop" },
  { key: "workshop3Name", value: "قانون الشغل", category: "workshop" },
  { key: "workshop3Icon", value: "⚖️", category: "workshop" },
  { key: "workshop4Name", value: "الخياطة التقليدية", category: "workshop" },
  { key: "workshop4Icon", value: "🧵", category: "workshop" },
  { key: "trainer1Name", value: "", category: "trainer" },
  { key: "trainer2Name", value: "", category: "trainer" },
  { key: "trainer3Name", value: "", category: "trainer" },
  { key: "trainer4Name", value: "", category: "trainer" },
  { key: "totalStudents", value: "113", category: "general" },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@boujdour.ma" },
    update: {},
    create: {
      email: "admin@boujdour.ma",
      name: "المدير",
      password: "admin123",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created");

  // Create trainers (one per workshop)
  const trainers = [
    { email: "it-trainer@boujdour.ma", name: "مؤطر المعلوميات", workshopId: "it" },
    { email: "accounting-trainer@boujdour.ma", name: "مؤطر المحاسبة", workshopId: "accounting" },
    { email: "labor-law-trainer@boujdour.ma", name: "مؤطر قانون الشغل", workshopId: "labor-law" },
    { email: "tailoring-trainer@boujdour.ma", name: "مؤطر الخياطة", workshopId: "tailoring" },
  ];

  for (const trainer of trainers) {
    await prisma.user.upsert({
      where: { email: trainer.email },
      update: {},
      create: {
        email: trainer.email,
        name: trainer.name,
        password: "admin123",
        role: "TRAINER",
        workshopId: trainer.workshopId,
      },
    });
  }
  console.log("✅ Trainers created");

  // Create workshops
  for (const workshop of workshops) {
    await prisma.workshop.upsert({
      where: { id: workshop.id },
      update: {},
      create: { id: workshop.id, name: workshop.name, icon: workshop.icon },
    });
  }
  console.log("✅ Workshops created");

  // Create default settings
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Default settings created");

  // Clear old students
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.student.deleteMany();
  console.log("✅ Cleared old data");

  // Create students
  let created = 0;
  for (const student of students) {
    try {
      await prisma.student.create({
        data: {
          registrationNo: student.registrationNo,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
          phone: student.phone,
          address: student.address,
          specialization: student.specialization,
          cohort: student.cohort,
          enrollmentDate: new Date("2026-06-15"),
        },
      });
      created++;
    } catch (error) {
      console.error(`❌ Error creating student ${student.registrationNo}:`, error);
    }
  }
  console.log(`✅ ${created} students seeded`);

  console.log("🎉 Seed completed!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
