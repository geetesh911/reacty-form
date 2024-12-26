import { createElement } from 'react';
import { observer } from '@legendapp/state/react';

import { useController } from '../hooks/use-controller.hook';
import type { ControllerProps, DefaultProps, FieldPath, FieldValues } from '../types';

const ControllerComponent = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TComponent extends React.FC = React.FC,
>({
    name,
    form,
    component,
    componentProps,
    render,
    setValueAs,
}: ControllerProps<TFieldValues, TName, TComponent>): React.ReactNode => {
    const { field, fieldState, formState } = useController<TFieldValues, TName>({
        name,
        form,
        setValueAs,
    });

    return render
        ? render({ field, fieldState, formState })
        : createElement(component as React.FC<DefaultProps>, { ...componentProps, ...field });
};

export const Controller = observer(ControllerComponent);
