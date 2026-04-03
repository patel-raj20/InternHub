/**
 * Utility functions for password strength validation
 * Includes checking against a list of common weak passwords
 * and using the "Have I Been Pwned" (HIBP) API via k-Anonymity
 * (Only sends the first 5 characters of a SHA-1 hash to preserve privacy)
 */

const WEAK_PASSWORDS = [
  "123456", "12345678", "123456789", "1234567890",
  "password", "password123", "password1234",
  "admin", "admin123", "admin1234", "admin12345",
  "qwerty", "qwertyuiop", "letmein", "welcome",
  "111111", "000000", "123123", "iloveyou"
];

export async function checkPasswordStrength(password: string): Promise<{ isWeak: boolean; message?: string; breachedCount?: number }> {
  if (!password) {
    return { isWeak: true, message: "Password is required." };
  }

  let count = 0;

  // 1. Check Have I Been Pwned API (HIBP) via k-Anonymity
  try {
    const utf8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (response.ok) {
       const text = await response.text();
       const lines = text.split("\n");
       const matchedLine = lines.find((line) => line.startsWith(suffix));
       if (matchedLine) {
         count = parseInt(matchedLine.split(":")[1].trim(), 10) || 0;
       }
    }
  } catch (err) {
    console.error("Password breach check failed. Allowing to proceed to avoid blocking user due to network errors.", err);
  }

  if (count > 0) {
    return { 
      isWeak: true, 
      message: `This password was found in a known data breach ${count.toLocaleString()} times. It is extremely unsafe to use.`,
      breachedCount: count
    };
  }

  // 2. Length check
  if (password.length < 10) {
    return { isWeak: true, message: "Password must be at least 10 characters long.", breachedCount: count };
  }

  // 3. Check local weak list
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return { isWeak: true, message: "This password is too common and easily guessed. Please use a stronger passphrase.", breachedCount: count };
  }

  return { isWeak: false, breachedCount: count };
}
