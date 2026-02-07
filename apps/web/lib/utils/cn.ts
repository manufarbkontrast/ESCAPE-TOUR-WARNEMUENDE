/**
 * Utility to merge Tailwind CSS classes
 * Simple implementation until clsx and tailwind-merge are installed
 */

/**
 * Merges multiple class strings, filtering out falsy values
 *
 * @param classes - Class strings or conditional class values
 * @returns Merged class string
 *
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 * // Returns: 'base-class active-class another-class' (if isActive is true)
 */
export function cn(...classes: ReadonlyArray<string | boolean | undefined | null>): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}
