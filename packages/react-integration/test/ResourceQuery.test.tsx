/* tslint:disable member-access */
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import { createRouter } from '@tg-resources/core';
import { DummyResource as Resource } from '@tg-resources/test-resource';
import React, { Component, ReactNode } from 'react';

import { ReactResourceProvider, ResourceQuery } from '../src';

afterEach(cleanup);

beforeAll(() => {
    window.addEventListener('error', e => {
        // I want to silence all errors and know what I'm doing
        e.preventDefault();
    });
});

const buildRouter = () =>
    createRouter(
        {
            test: {
                list: '/test',
                details: '/test/${pk}',
            },
        },
        { apiRoot: '/api' },
        Resource
    );

class ErrorBoundary extends Component<
    {
        onError: (error: any, errorInfo: React.ErrorInfo) => void;
        children: ReactNode;
    },
    { hasError: boolean }
> {
    state = {
        hasError: false,
    };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.props.onError(error, errorInfo);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return null;
    }
}

describe('ResourceQuery', () => {
    test('no provider errors', done => {
        const assertError = (error: Error) => {
            expect(`${error}`).toMatch(
                'Could not find @tg-resources/react context value. Ensure component is wrapped in a <ReactResourceProvider>'
            );
            done();
        };

        render(
            <ErrorBoundary onError={assertError}>
                <ResourceQuery
                    routeName="test"
                    children={() => done(new Error('Expected to error'))}
                />
            </ErrorBoundary>
        );
    });
    test('wrong routeName errors', done => {
        const router = buildRouter();
        const assertError = (error: Error) => {
            expect(`${error}`).toMatch('Resource for "test2" was not found!');
            done();
        };

        render(
            <ErrorBoundary onError={assertError}>
                <ReactResourceProvider router={router}>
                    <ResourceQuery
                        routeName="test2"
                        children={() => done(new Error('Expected to error'))}
                    />
                </ReactResourceProvider>
            </ErrorBoundary>
        );
    });
});
