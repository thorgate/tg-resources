import { hasValue, isObject } from '@tg-resources/is';

// Needle defaults to {value} or ${value}
const needle = /\$?{([\s\S]+?)}/g;

function compileURL(template: string) {
    const render = (params: Record<string, unknown>) =>
        template.replace(needle, (_, key: any) => {
            let value: Record<string, unknown> | unknown = params;
            let itemKey = key;

            while (itemKey.includes('.')) {
                const curKey: string = itemKey.split('.')[0];
                value = isObject(value) ? value?.[curKey] : undefined;

                itemKey = itemKey.split('.').slice(1).join('.');
            }

            const finalValue = isObject(value) ? value[itemKey] : '';
            return hasValue(finalValue) ? `${finalValue}` : '';
        });

    return render;
}

export default compileURL;
