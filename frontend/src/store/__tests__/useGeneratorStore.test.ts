import { describe, it, expect, beforeEach } from 'vitest';
import { useGeneratorStore } from '../useGeneratorStore';

describe('useGeneratorStore', () => {
  beforeEach(() => {
    useGeneratorStore.getState().reset();
  });

  it('should initialize with default state', () => {
    const state = useGeneratorStore.getState();
    expect(state.selectedLanguage).toBeNull();
    expect(state.selectedFeature).toBeNull();
    expect(state.options).toEqual({});
    expect(state.generatedCode).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set language', () => {
    useGeneratorStore.getState().setLanguage('html5');
    expect(useGeneratorStore.getState().selectedLanguage).toBe('html5');
  });

  it('should reset feature when language changes', () => {
    useGeneratorStore.getState().setFeature('form');
    useGeneratorStore.getState().setLanguage('html5');
    expect(useGeneratorStore.getState().selectedFeature).toBe('form');

    useGeneratorStore.getState().setLanguage('css3');
    expect(useGeneratorStore.getState().selectedFeature).toBeNull();
  });

  it('should set feature', () => {
    useGeneratorStore.getState().setFeature('form');
    expect(useGeneratorStore.getState().selectedFeature).toBe('form');
  });

  it('should set options', () => {
    const options = { tableName: 'users', entityName: 'User' };
    useGeneratorStore.getState().setOptions(options);
    expect(useGeneratorStore.getState().options).toEqual(options);
  });

  it('should reset to initial state', () => {
    useGeneratorStore.getState().setLanguage('html5');
    useGeneratorStore.getState().setFeature('form');
    useGeneratorStore.getState().setOptions({ test: 'value' });

    useGeneratorStore.getState().reset();

    const state = useGeneratorStore.getState();
    expect(state.selectedLanguage).toBeNull();
    expect(state.selectedFeature).toBeNull();
    expect(state.options).toEqual({});
  });
});

