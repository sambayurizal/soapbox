import {
  Map as ImmutableMap,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';
import { AnyAction } from 'redux';

import {
  FOLLOWERS_FETCH_SUCCESS,
  FOLLOWERS_EXPAND_SUCCESS,
  FOLLOWING_FETCH_SUCCESS,
  FOLLOWING_EXPAND_SUCCESS,
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  PINNED_ACCOUNTS_FETCH_SUCCESS,
  BIRTHDAY_REMINDERS_FETCH_SUCCESS,
} from 'soapbox/actions/accounts';
import {
  BLOCKS_FETCH_SUCCESS,
  BLOCKS_EXPAND_SUCCESS,
} from 'soapbox/actions/blocks';
import {
  DIRECTORY_FETCH_REQUEST,
  DIRECTORY_FETCH_SUCCESS,
  DIRECTORY_FETCH_FAIL,
  DIRECTORY_EXPAND_REQUEST,
  DIRECTORY_EXPAND_SUCCESS,
  DIRECTORY_EXPAND_FAIL,
} from 'soapbox/actions/directory';
import {
  EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
} from 'soapbox/actions/events';
import {
  FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
} from 'soapbox/actions/familiar-followers';
import {
  REBLOGS_FETCH_SUCCESS,
  FAVOURITES_FETCH_SUCCESS,
  REACTIONS_FETCH_SUCCESS,
} from 'soapbox/actions/interactions';
import {
  MUTES_FETCH_SUCCESS,
  MUTES_EXPAND_SUCCESS,
} from 'soapbox/actions/mutes';
import {
  NOTIFICATIONS_UPDATE,
} from 'soapbox/actions/notifications';

import type { APIEntity } from 'soapbox/types/entities';

export const ListRecord = ImmutableRecord({
  next: null as string | null,
  items: ImmutableOrderedSet<string>(),
  isLoading: false,
});

export const ReactionRecord = ImmutableRecord({
  accounts: ImmutableOrderedSet<string>(),
  count: 0,
  name: '',
});

const ReactionListRecord = ImmutableRecord({
  next: null as string | null,
  items: ImmutableOrderedSet<Reaction>(),
  isLoading: false,
});

export const ParticipationRequestRecord = ImmutableRecord({
  account: '',
  participation_message: null as string | null,
});

const ParticipationRequestListRecord = ImmutableRecord({
  next: null as string | null,
  items: ImmutableOrderedSet<ParticipationRequest>(),
  isLoading: false,
});

export const ReducerRecord = ImmutableRecord({
  followers: ImmutableMap<string, List>(),
  following: ImmutableMap<string, List>(),
  reblogged_by: ImmutableMap<string, List>(),
  favourited_by: ImmutableMap<string, List>(),
  reactions: ImmutableMap<string, ReactionList>(),
  follow_requests: ListRecord(),
  blocks: ListRecord(),
  mutes: ListRecord(),
  directory: ListRecord({ isLoading: true }),
  pinned: ImmutableMap<string, List>(),
  birthday_reminders: ImmutableMap<string, List>(),
  familiar_followers: ImmutableMap<string, List>(),
  event_participations: ImmutableMap<string, List>(),
  event_participation_requests: ImmutableMap<string, ParticipationRequestList>(),
});

type State = ReturnType<typeof ReducerRecord>;
export type List = ReturnType<typeof ListRecord>;
type Reaction = ReturnType<typeof ReactionRecord>;
type ReactionList = ReturnType<typeof ReactionListRecord>;
type ParticipationRequest = ReturnType<typeof ParticipationRequestRecord>;
type ParticipationRequestList = ReturnType<typeof ParticipationRequestListRecord>;
type Items = ImmutableOrderedSet<string>;
type NestedListPath = ['followers' | 'following' | 'reblogged_by' | 'favourited_by' | 'reactions' | 'pinned' | 'birthday_reminders' | 'familiar_followers' | 'event_participations' | 'event_participation_requests', string];
type ListPath = ['follow_requests' | 'blocks' | 'mutes' | 'directory'];

const normalizeList = (state: State, path: NestedListPath | ListPath, accounts: APIEntity[], next?: string | null) => {
  return state.setIn(path, ListRecord({
    next,
    items: ImmutableOrderedSet(accounts.map(item => item.id)),
  }));
};

const appendToList = (state: State, path: NestedListPath | ListPath, accounts: APIEntity[], next: string | null) => {
  return state.updateIn(path, map => {
    return (map as List)
      .set('next', next)
      .set('isLoading', false)
      .update('items', list => (list as Items).concat(accounts.map(item => item.id)));
  });
};

const removeFromList = (state: State, path: NestedListPath | ListPath, accountId: string) => {
  return state.updateIn(path, map => {
    return (map as List).update('items', list => (list as Items).filterNot(item => item === accountId));
  });
};

const normalizeFollowRequest = (state: State, notification: APIEntity) => {
  return state.updateIn(['follow_requests', 'items'], list => {
    return ImmutableOrderedSet([notification.account.id]).union(list as Items);
  });
};

export default function userLists(state = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['followers', action.id], action.accounts, action.next);
    case FOLLOWERS_EXPAND_SUCCESS:
      return appendToList(state, ['followers', action.id], action.accounts, action.next);
    case FOLLOWING_FETCH_SUCCESS:
      return normalizeList(state, ['following', action.id], action.accounts, action.next);
    case FOLLOWING_EXPAND_SUCCESS:
      return appendToList(state, ['following', action.id], action.accounts, action.next);
    case REBLOGS_FETCH_SUCCESS:
      return normalizeList(state, ['reblogged_by', action.id], action.accounts);
    case FAVOURITES_FETCH_SUCCESS:
      return normalizeList(state, ['favourited_by', action.id], action.accounts);
    case REACTIONS_FETCH_SUCCESS:
      return state.setIn(['reactions', action.id], ReactionListRecord({
        items: ImmutableOrderedSet<Reaction>(action.reactions.map(({ accounts, ...reaction }: APIEntity) => ReactionRecord({
          ...reaction,
          accounts: ImmutableOrderedSet(accounts.map((account: APIEntity) => account.id)),
        }))),
      }));
    case NOTIFICATIONS_UPDATE:
      return action.notification.type === 'follow_request' ? normalizeFollowRequest(state, action.notification) : state;
    case FOLLOW_REQUESTS_FETCH_SUCCESS:
      return normalizeList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUESTS_EXPAND_SUCCESS:
      return appendToList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return removeFromList(state, ['follow_requests'], action.id);
    case BLOCKS_FETCH_SUCCESS:
      return normalizeList(state, ['blocks'], action.accounts, action.next);
    case BLOCKS_EXPAND_SUCCESS:
      return appendToList(state, ['blocks'], action.accounts, action.next);
    case MUTES_FETCH_SUCCESS:
      return normalizeList(state, ['mutes'], action.accounts, action.next);
    case MUTES_EXPAND_SUCCESS:
      return appendToList(state, ['mutes'], action.accounts, action.next);
    case DIRECTORY_FETCH_SUCCESS:
      return normalizeList(state, ['directory'], action.accounts, action.next);
    case DIRECTORY_EXPAND_SUCCESS:
      return appendToList(state, ['directory'], action.accounts, action.next);
    case DIRECTORY_FETCH_REQUEST:
    case DIRECTORY_EXPAND_REQUEST:
      return state.setIn(['directory', 'isLoading'], true);
    case DIRECTORY_FETCH_FAIL:
    case DIRECTORY_EXPAND_FAIL:
      return state.setIn(['directory', 'isLoading'], false);
    case PINNED_ACCOUNTS_FETCH_SUCCESS:
      return normalizeList(state, ['pinned', action.id], action.accounts, action.next);
    case BIRTHDAY_REMINDERS_FETCH_SUCCESS:
      return normalizeList(state, ['birthday_reminders', action.id], action.accounts, action.next);
    case FAMILIAR_FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['familiar_followers', action.id], action.accounts, action.next);
    case EVENT_PARTICIPATIONS_FETCH_SUCCESS:
      return normalizeList(state, ['event_participations', action.id], action.accounts, action.next);
    case EVENT_PARTICIPATIONS_EXPAND_SUCCESS:
      return appendToList(state, ['event_participations', action.id], action.accounts, action.next);
    case EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS:
      return state.setIn(['event_participation_requests', action.id], ParticipationRequestListRecord({
        next: action.next,
        items: ImmutableOrderedSet(action.participations.map(({ account, participation_message }: APIEntity) => ParticipationRequestRecord({
          account: account.id,
          participation_message,
        }))),
      }));
    case EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS:
      return state.updateIn(
        ['event_participation_requests', action.id, 'items'],
        (items) => (items as ImmutableOrderedSet<ParticipationRequest>)
          .union(action.participations.map(({ account, participation_message }: APIEntity) => ParticipationRequestRecord({
            account: account.id,
            participation_message,
          }))),
      );
    case EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS:
    case EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS:
      return state.updateIn(
        ['event_participation_requests', action.id, 'items'],
        items => (items as ImmutableOrderedSet<ParticipationRequest>).filter(({ account }) => account !== action.accountId),
      );
    default:
      return state;
  }
}