import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { beforeAll, afterEach } from '@jest/globals';
import React from 'react';

global.React = React; // this also works for other globally available libraries
beforeAll(() => {});

afterEach(() => {
  cleanup();
});
