export type DeepType<T, V> = {
    [K in keyof T]: T[K] extends object ? DeepType<T[K], V> : V;
};
