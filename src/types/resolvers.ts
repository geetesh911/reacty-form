import type { FieldErrors } from './errors';
import type { Field, FieldName, FieldValues, InternalFieldName } from './fields';
import type { CriteriaMode } from './form';

export type ResolverSuccess<TFieldValues extends FieldValues = FieldValues> = {
    values: TFieldValues;
    errors: object;
};

export type ResolverError<TFieldValues extends FieldValues = FieldValues> = {
    values: object;
    errors: FieldErrors<TFieldValues>;
};

export type ResolverResult<TFieldValues extends FieldValues = FieldValues> =
    | ResolverSuccess<TFieldValues>
    | ResolverError<TFieldValues>;

export interface ResolverOptions<TFieldValues extends FieldValues> {
    criteriaMode?: CriteriaMode;
    fields: Record<InternalFieldName, Field['_f']>;
    names?: FieldName<TFieldValues>[];
    shouldUseNativeValidation: boolean | undefined;
}

export type Resolver<TFieldValues extends FieldValues = FieldValues, TContext = any> = (
    values: TFieldValues,
    context: TContext | undefined,
    options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;
