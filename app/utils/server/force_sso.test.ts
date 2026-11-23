// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Sso} from '@constants';

import {loginOptions} from './index';

jest.mock('@assets/config.json', () => ({
    ForceSsoProvider: 'GITLAB',
}));

jest.mock('@utils/helpers', () => ({
    isMinimumServerVersion: jest.fn(() => true),
    isTablet: jest.fn(() => true),
}));

jest.mock('@screens/navigation', () => ({
    navigateToScreen: jest.fn(),
}));

describe('Dumont forced SSO provider', () => {
    it('enables GitLab even when the server does not advertise it', () => {
        const config = {
            EnableSaml: 'false',
            EnableSignUpWithGitLab: 'false',
            EnableSignUpWithGoogle: 'false',
            EnableSignUpWithOffice365: 'false',
            EnableSignUpWithOpenId: 'false',
            EnableLdap: 'false',
            EnableSignInWithEmail: 'true',
            EnableSignInWithUsername: 'false',
            Version: '5.0.0',
        } as ClientConfig;
        const license = {IsLicensed: 'false'} as ClientLicense;

        const result = loginOptions(config, license);

        expect(result.enabledSSOs).toEqual([Sso.GITLAB]);
        expect(result.ssoOptions[Sso.GITLAB].enabled).toBe(true);
    });
});
