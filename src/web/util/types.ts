/**
 * Public constructor type.
 *
 * @param T - The class instance type.
 * @param A - The constructor argument types.
 */
export type Constructor<T = unknown, A extends unknown[] = any[]> = (new (...args: A) => T) & Class<T>;

/**
 * Class type which even works for classes with a private constructor. If you have a public constructor consider
 * using {@link Constructor} instead.
 *
 * @param T - The class instance type.
 */
export type Class<T = unknown> = Function & { prototype: T };
