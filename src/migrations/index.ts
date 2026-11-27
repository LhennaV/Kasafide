import * as migration_20261123_123230_initial from './20261123_123230_initial';
import * as migration_20261127_083354_qa_uploads from './20261127_083354_qa_uploads';

export const migrations = [
  {
    up: migration_20261123_123230_initial.up,
    down: migration_20261123_123230_initial.down,
    name: '20261123_123230_initial',
  },
  {
    up: migration_20261127_083354_qa_uploads.up,
    down: migration_20261127_083354_qa_uploads.down,
    name: '20261127_083354_qa_uploads'
  },
];
