import type { Config } from '@keystatic/core';
import { Keystatic } from '@keystatic/core/ui';
import keystaticConfig from '../../keystatic.config';

const appSlug = {
  envName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG',
  value: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
};

export default function KeystaticAdmin() {
  return <Keystatic config={keystaticConfig as Config} appSlug={appSlug} />;
}
