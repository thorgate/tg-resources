export interface PrepareKwargs<TKwargs> {
    (...args: any[]): TKwargs;
}

export type IfPrepareKwargsProvided<
    PK extends PrepareKwargs<any> | void,
    True,
    False
> = PK extends (...args: any[]) => any ? True : False;

export interface BaseRouteTemplate {
    configure: (apiRoot: string) => void;

    routePath: string;
}

export interface RouteTemplateWithoutKwargs extends BaseRouteTemplate {
    (): string;
}

export interface RouteTemplateWithKwargs<TKwargs> extends BaseRouteTemplate {
    (kwargs: TKwargs): string;
}

export type RouteTemplate<
    TKwargs = void,
    PK extends PrepareKwargs<any> | void = void
> = IfPrepareKwargsProvided<
    PK,
    RouteTemplateWithKwargs<TKwargs>,
    RouteTemplateWithoutKwargs
>;

export type RouteTemplateKwargs<
    T,
    Fallback = void
> = T extends RouteTemplateWithKwargs<infer U>
    ? U
    : T extends RouteTemplateWithoutKwargs
    ? Fallback
    : never;
