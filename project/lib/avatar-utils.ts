/**
 * Utility functions for generating text-based avatars
 */

// Array of gradient colors in the site's theme
const gradients = [
  'from-purple-500 to-blue-500',
  'from-blue-500 to-cyan-500',
  'from-purple-600 to-indigo-600',
  'from-indigo-500 to-blue-600',
  'from-violet-500 to-purple-500',
  'from-fuchsia-500 to-pink-500',
  'from-rose-500 to-red-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-500',
  'from-teal-500 to-cyan-500',
];

/**
 * Generates a consistent gradient background based on a user's name or email
 * @param name The user's name or email
 * @returns A CSS class string for the gradient background
 */
export function getAvatarGradient(name: string): string {
  // Use the sum of character codes to create a deterministic index
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = charSum % gradients.length;
  return gradients[index];
}

/**
 * Gets the initials from a user's name
 * @param name The user's name or email
 * @returns One or two uppercase letters representing the user's initials
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  // If it's an email, use the first character before the @ symbol
  if (name.includes('@')) {
    return name.split('@')[0][0].toUpperCase();
  }
  
  // For names, get first letters of first and last name
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  
  // Get first letter of first and last name
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
} 