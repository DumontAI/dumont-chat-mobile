// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Image} from 'expo-image';
import React from 'react';

import {View as ViewConstants} from '@constants';

// The web client swaps this avatar through injected CSS; mobile renders its own
// component, which is why System posts still showed the upstream glyph here.
const BRAND_MARK = require('@assets/images/dumont_mark.png');

const style = {
    width: ViewConstants.PROFILE_PICTURE_SIZE,
    height: ViewConstants.PROFILE_PICTURE_SIZE,
    borderRadius: ViewConstants.PROFILE_PICTURE_SIZE / 2,
};

const SystemAvatar = () => {
    return (
        <Image
            source={BRAND_MARK}
            style={style}
            contentFit='cover'
            accessibilityLabel='System'
        />
    );
};

export default SystemAvatar;
