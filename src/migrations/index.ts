import * as migration_20261123_123230_initial from './20261123_123230_initial';
import * as migration_20261127_094135_qa_uploads from './20261127_094135_qa_uploads';
import * as migration_20261127_113433_payments_support_onboarding from './20261127_113433_payments_support_onboarding';
import * as migration_20261127_132105_payout_choices from './20261127_132105_payout_choices';

export const migrations = [
  {
    up: migration_20261123_123230_initial.up,
    down: migration_20261123_123230_initial.down,
    name: '20261123_123230_initial',
  },
  {
    up: migration_20261127_094135_qa_uploads.up,
    down: migration_20261127_094135_qa_uploads.down,
    name: '20261127_094135_qa_uploads',
  },
  {
    up: migration_20261127_113433_payments_support_onboarding.up,
    down: migration_20261127_113433_payments_support_onboarding.down,
    name: '20261127_113433_payments_support_onboarding',
  },
  {
    up: migration_20261127_132105_payout_choices.up,
    down: migration_20261127_132105_payout_choices.down,
    name: '20261127_132105_payout_choices'
  },
];
