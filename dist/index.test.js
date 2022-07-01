"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
test('Should create add dependencies command correctly', () => {
    const mockParams = {
        'react-native-location': '^2.5.0',
        'react-native-maps': '^0.29.4',
        'react-native-pdf': '^6.5.0',
        'react-native-rate': '^1.2.9',
        'react-native-reanimated': '^2.2.3',
    };
    const command = (0, _1.getManageDependenciesCommand)(mockParams, 'add');
    expect(command).toEqual('yarn add react-native-location@^2.5.0 react-native-maps@^0.29.4 react-native-pdf@^6.5.0 react-native-rate@^1.2.9 react-native-reanimated@^2.2.3 ');
});
test('Should create upgrade dependencies command correctly', () => {
    const mockParams = {
        'react-native-location': '^2.5.0',
        'react-native-maps': '^0.29.4',
        'react-native-pdf': '^6.5.0',
        'react-native-rate': '^1.2.9',
        'react-native-reanimated': '^2.2.3',
    };
    const command = (0, _1.getManageDependenciesCommand)(mockParams, 'upgrade');
    expect(command).toEqual('yarn upgrade react-native-location@^2.5.0 react-native-maps@^0.29.4 react-native-pdf@^6.5.0 react-native-rate@^1.2.9 react-native-reanimated@^2.2.3 ');
});
describe('Testing dependencies changes', () => {
    test('Should not consider diff if source package have same dependency and version as target package', () => {
        const source = { 'deep-object-diff': '^1.1.0', jest: '^26.6.3' };
        const target = { 'deep-object-diff': '^1.1.0' };
        const { added, updated } = (0, _1.getDependenciesChanges)(source, target);
        expect(added).toEqual({});
        expect(updated).toEqual({});
    });
    test('Should consider diff if source package have same dependency but upgraded version on target package', () => {
        const source = { 'deep-object-diff': '^1.1.0', jest: '^26.6.3' };
        const target = { 'deep-object-diff': '^1.2.0' };
        const { added, updated } = (0, _1.getDependenciesChanges)(source, target);
        expect(added).toEqual({});
        expect(updated).toEqual({ 'deep-object-diff': '^1.2.0' });
    });
    test('Should consider diff if target package has added version', () => {
        const source = { 'deep-object-diff': '^1.1.0' };
        const target = { 'deep-object-diff': '^1.1.0', jest: '^26.6.3' };
        const { added, updated } = (0, _1.getDependenciesChanges)(source, target);
        expect(added).toEqual({ jest: '^26.6.3' });
        expect(updated).toEqual({});
    });
    test('Should consider diff if target package has added version and some upgraded dependency version', () => {
        const source = { 'deep-object-diff': '^1.1.0' };
        const target = { 'deep-object-diff': '^1.2.0', jest: '^26.6.3' };
        const { added, updated } = (0, _1.getDependenciesChanges)(source, target);
        expect(added).toEqual({ jest: '^26.6.3' });
        expect(updated).toEqual({ 'deep-object-diff': '^1.2.0' });
    });
});
