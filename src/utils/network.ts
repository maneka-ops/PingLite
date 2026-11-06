import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);

  if (parts.length !== 4 || parts.some(
    n => !Number.isInteger(n) || n < 0 || n > 255
  )) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().split('%')[0];

  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    normalized.startsWith('ff')
  ) {
    return true;
  }

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice(7);

    if (isIP(mapped) === 4) {
      return isPrivateIPv4(mapped);
    }
  }

  return false;
}

function isPublicIP(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) {
    return !isPrivateIPv4(ip);
  }

  if (version === 6) {
    return !isPrivateIPv6(ip);
  }

  return false;
}

export async function validateDestination(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS are supported.');
  }

  if (url.username || url.password) {
    throw new Error('URL credentials are not allowed.');
  }

  if (url.port && !['80', '443'].includes(url.port)) {
    throw new Error('Only ports 80 and 443 are allowed.');
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.test') ||
    hostname.endsWith('.invalid')
  ) {
    throw new Error('Local destinations are not allowed.');
  }

  const version = isIP(hostname);

  if (version) {
    if (!isPublicIP(hostname)) {
      throw new Error('Private IP addresses are not allowed.');
    }

    return url;
  }

  let addresses;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true
    });
  } catch {
    throw new Error('Unable to resolve website hostname.');
  }

  if (
    addresses.length === 0 ||
    addresses.some(address => !isPublicIP(address.address))
  ) {
    throw new Error('Website resolves to a restricted IP address.');
  }

  return url;
}