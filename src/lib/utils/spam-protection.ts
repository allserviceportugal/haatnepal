// Comprehensive list of disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  // Original list
  "mailinator.com",
  "temp-mail.org",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwaway.email",
  "temp-mail.io",
  "yopmail.com",
  "sharklasers.com",
  // Extended list - common disposable services
  "guerrillamailblock.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "pokemail.net",
  "spam4.me",
  "spam11.com",
  "spam13.com",
  "spam14.com",
  "spam15.com",
  "spam16.com",
  "spam17.com",
  "spam18.com",
  "spam4u.com",
  "spambox.us",
  "spamavert.com",
  "spambog.com",
  "spamcorptastic.com",
  "spamcowboy.com",
  "spamfighter.cf",
  "spamfighter.ga",
  "spamfighter.ml",
  "spamfighter.tk",
  "spamgourmet.com",
  "spamherelots.com",
  "spamhereplease.com",
  "spamhole.com",
  "spamify.com",
  "spaml.com",
  "spammotel.com",
  "spammyemail.com",
  "spamola.com",
  "spamspot.com",
  "tempinbox.com",
  "tempomail.com",
  "tempmail.dev",
  "tempmail.email",
  "tempmail.lol",
  "tempmail.org",
  "tempmail.store",
  "tempmailaddress.com",
  "temporaryemail.com",
  "temporaryx.com",
  "tempsmtp.com",
  "tempsy.net",
  "temptation.com",
  "tendoesnotemail.com",
  "tenminutes.com",
  "temail.net",
  "temp-smtp.com",
  "tempemailaddress.com",
  "temporalemail.com",
  "trashmail.com",
  "trashymail.com",
  "trashbin.co",
  "trashemail.de",
  "trashmail.ws",
  "trashmail.nl",
  "trashmail.at",
  "trashmail.ch",
  "trashmail.com.br",
  "trash-mail.com",
  "trashmail.dev",
  "trashmails.com",
  "yopmail.fr",
  "yopmail.net",
  "yopmail.cc",
  "yomailx.com",
  "yopmail.com.br",
  "yopmail.co.uk",
  "yopmail.de",
  "yopmail.es",
  "yopmail.fr",
  "yopmail.it",
  "yopmail.jp",
  "yopmail.nl",
  "yopmail.ru",
  "yopmail.se",
  "yopmail.com.tr",
  "maildrop.cc",
  "mailnesia.com",
  "maildrop.io",
  "maildrop.org",
  "maildrop.store",
  "mailinator.com",
  "mailinator.net",
  "mailinator.org",
  "mailinator2.com",
  "mailinator.us",
  "mintemail.com",
  "mailnator.com",
  "mailnesia.com",
  "mailmade.com",
  "mailmetrash.com",
  "mailmethistemporaryemail.com",
  "mailmodo.com",
  "mailsac.com",
  "mailsharx.com",
  "mailshell.com",
  "mailslite.com",
  "mailslurp.com",
  "mailstare.com",
  "mailnesia.com",
  "mailtester.com",
  "mailtrap.io",
  "mailtrix.com",
  "mailure.com",
  "mailx.ml",
  "mailz.co",
  "meltmail.com",
  "mintemail.com",
  "misterpornama.com",
  "mockemail.com",
  "modernfemale.com",
  "mohamail.com",
  "mohmal.com",
  "momail.com",
  "momailz.com",
  "monmail.net",
  "moocowmail.com",
  "moonmail.com",
  "mopemall.com",
  "mopemail.com",
  "moquail.com",
  "morningmail.com",
  "morm.one",
  "mormaiil.com",
  "mosail.com",
  "motionemail.com",
  "moymail.com",
  "mozmail.com",
  "mozonecmail.com",
  "mpomail.com",
  "mstempmail.com",
  "msxbox360.com",
  "mt2009.com",
  "mtempmail.com",
  "muil.io",
  "multifakeemail.com",
  "mustbeemail.com",
  "mytrashmail.com",
  "mytempamail.com",
  "nakedemails.com",
  "nallmail.com",
  "namemail.com",
  "nanoomail.fr",
  "napev.com",
  "napev.net",
  "napev.org",
  "napev.tk",
  "naticiaspam.com",
  "neatmail.com",
  "nebulamail.com",
  "needtomail.com",
  "neko.im",
  "nemexmail.com",
  "nepalmail.com",
  "nepalmail.info",
  "nepmail.com",
  "nerdomail.com",
  "nervoemail.com",
  "nesmail.com",
  "netmask.cc",
  "netmask.cloud",
  "netmask.dev",
  "netmask.digital",
  "netmask.email",
  "netmask.fun",
  "netmask.lol",
  "netmask.online",
  "netmask.pro",
  "netmask.sh",
  "netmask.store",
  "netmask.tech",
  "netmask.ws",
  "netmask.xyz",
  "netzero.net",
  "neuralyzer.com",
  "neutronian.com",
  "neutralmail.com",
  "neutralmails.com",
  "never-spam.com",
  "new.getnada.com",
  "newmail.net",
  "newmailbox.com",
  "nexmail.com",
  "nextmail.net",
  "ngocok.com",
  "nhentais.com",
  "ni2.co",
  "nichemail.com",
  "nilemail.com",
  "nimbusemail.com",
  "nineemail.com",
  "ninemail.com",
  "ninetyemail.com",
  "ninthmail.com",
  "nithmail.com",
  "nitmail.com",
  "nnmra.com",
  "noactualmail.com",
  "noaddress.net",
  "noaddressmail.com",
  "noagency.com",
  "noahmail.com",
  "noanymail.com",
  "noaspammail.com",
  "nobail.com",
  "noballsemail.com",
  "noballs.net",
  "nobodymail.com",
  "nocap.email",
  "nocapmail.com",
  "nocapemails.com",
  "nocaps.net",
  "nocaremail.com",
  "nocemail.com",
  "nocmail.com",
  "nocodemail.com",
  "nocoolmail.com",
  "nocopyrightinfringement.com",
  "nocoremail.com",
  "nodac.com",
  "nodaddy.com",
  "nodamail.com",
  "nodarkmail.com",
  "nodata.ml",
  "nodatamail.com",
  "nodataemail.com",
  "nodeath.com",
  "nodebtmail.com",
  "nodebugging.com",
  "nodefinitemail.com",
  "nodelay.org",
  "nodelaymail.com",
  "nodelemail.com",
  "nodeliverymail.com",
  "nodemail.com",
  "nodenialmail.com",
  "nodepomail.com",
  "nodesumemail.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Nepal phone: 7-10 digits (mobile or landline)
  const { NEPAL_PHONE_REGEX, normalizeNepalPhone } = require("@/lib/constants/phone");
  const normalized = normalizeNepalPhone(phone);
  return NEPAL_PHONE_REGEX.test(normalized);
}

export async function hasMxRecord(domain: string): Promise<boolean> {
  // Cloudflare DoH. Returns `Status` on any well-formed response: 0 = NOERROR,
  // 3 = NXDOMAIN. On NXDOMAIN there is no `Answer` key at all, which is why the
  // previous `data.Answer && ...` produced `undefined` and the `?? true` fallback
  // let every non-existent domain through — the check could never reject anything.
  const query = async (type: "MX" | "A") => {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
      { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(2000) }
    );
    if (!response.ok) throw new Error(`DoH ${type} lookup returned ${response.status}`);
    return (await response.json()) as {
      Status?: number;
      Answer?: Array<{ type: number; data: string }>;
    };
  };

  try {
    const mx = await query("MX");

    // Malformed response - fail open rather than block a legitimate signup.
    if (typeof mx.Status !== "number") return true;

    // NXDOMAIN and friends: the domain does not resolve, so it cannot receive mail.
    if (mx.Status !== 0) {
      console.log(`[MX_CHECK] ${domain} does not resolve (DNS status ${mx.Status})`);
      return false;
    }

    if (Array.isArray(mx.Answer) && mx.Answer.some((r) => r.type === 15)) return true;

    // The domain resolves but publishes no MX. RFC 5321 allows delivery to fall
    // back to the A record, so only reject when there is no A record either.
    const a = await query("A");
    const hasA = a.Status === 0 && Array.isArray(a.Answer) && a.Answer.some((r) => r.type === 1);
    if (!hasA) console.log(`[MX_CHECK] ${domain} has neither MX nor A record`);
    return hasA;
  } catch (error) {
    // Fail open on timeout, network error, or non-ok response: a DNS blip must
    // never block signups.
    console.log(`[MX_CHECK] Error checking MX for ${domain}:`, error);
    return true;
  }
}
