import { addons } from '@storybook/manager-api';
import { getPreferredColorScheme } from './dsfr-theme.js';

addons.setConfig({
  theme: getPreferredColorScheme()
});
