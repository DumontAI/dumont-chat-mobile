// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase, withObservables} from '@nozbe/watermelondb/react';
import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {map} from 'rxjs/operators';

import {handleTeamChange} from '@actions/remote/team';
import SlideUpPanelItem from '@components/slide_up_panel_item';
import {useServerUrl} from '@context/server';
import {queryJoinedTeams} from '@queries/servers/team';
import {dismissBottomSheet} from '@screens/navigation';
import {confirmLeaveTeam, openJoinTeamModal} from '@utils/team_menu';

import type {WithDatabaseArgs} from '@typings/database/database';

type TeamOption = {
    id: string;
    displayName: string;
};

type Props = {
    canJoinOtherTeams: boolean;
    hasMoreThanOneTeam: boolean;
    currentTeamId: string;
    currentTeamDisplayName: string;
    teams: TeamOption[];
}

// SlideUpPanelItem's onPress takes no argument, so the row owns its id rather
// than the parent creating a new closure per team on every render.
const TeamOptionItem = ({team, isCurrent, onSelect}: {team: TeamOption; isCurrent: boolean; onSelect: (teamId: string) => void}) => {
    const onPress = useCallback(() => onSelect(team.id), [onSelect, team.id]);

    return (
        <SlideUpPanelItem
            leftIcon={isCurrent ? 'check' : 'account-multiple-outline'}
            onPress={onPress}
            testID={`team_menu.select_team.${team.id}`}
            text={team.displayName}
        />
    );
};

const TeamMenu = ({canJoinOtherTeams, hasMoreThanOneTeam, currentTeamId, currentTeamDisplayName, teams}: Props) => {
    const intl = useIntl();
    const serverUrl = useServerUrl();

    const onJoinAnotherTeam = useCallback(async () => {
        await dismissBottomSheet();
        openJoinTeamModal();
    }, []);

    const onLeaveTeam = useCallback(async () => {
        await dismissBottomSheet();
        confirmLeaveTeam(intl, serverUrl, currentTeamId, currentTeamDisplayName);
    }, [intl, serverUrl, currentTeamId, currentTeamDisplayName]);

    // Switching teams used to be possible only from the left-hand rail. With the
    // rail gone, the team name itself is the switcher.
    const onSelectTeam = useCallback(async (teamId: string) => {
        await dismissBottomSheet();
        if (teamId !== currentTeamId) {
            handleTeamChange(serverUrl, teamId);
        }
    }, [currentTeamId, serverUrl]);

    return (
        <>
            {teams.map((team) => (
                <TeamOptionItem
                    key={team.id}
                    team={team}
                    isCurrent={team.id === currentTeamId}
                    onSelect={onSelectTeam}
                />
            ))}
            {canJoinOtherTeams && (
                <SlideUpPanelItem
                    leftIcon='account-multiple-plus-outline'
                    onPress={onJoinAnotherTeam}
                    testID='team_menu.join_another_team'
                    text={intl.formatMessage({id: 'mobile.add_team.join_team', defaultMessage: 'Join Another Team'})}
                />
            )}
            {hasMoreThanOneTeam && (
                <SlideUpPanelItem
                    destructive={true}
                    leftIcon='exit-to-app'
                    onPress={onLeaveTeam}
                    testID='team_menu.leave_team'
                    text={intl.formatMessage({id: 'mobile.team_menu.leave_team', defaultMessage: 'Leave team'})}
                />
            )}
        </>
    );
};

const byDisplayName = (a: TeamOption, b: TeamOption) =>
    a.displayName.toLocaleLowerCase().localeCompare(b.displayName.toLocaleLowerCase());

const toOption = (t: {id: string; displayName: string}): TeamOption => ({id: t.id, displayName: t.displayName});

const toSortedOptions = (ts: Array<{id: string; displayName: string}>) => ts.map(toOption).sort(byDisplayName);

const enhanced = withObservables([], ({database}: WithDatabaseArgs) => ({
    teams: queryJoinedTeams(database).observe().pipe(map(toSortedOptions)),
}));

export default withDatabase(enhanced(TeamMenu));
