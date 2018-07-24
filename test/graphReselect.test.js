import { fromJS, Map } from 'immutable';
import {generateGraphSelector} from '../src';
import { expect } from 'chai';

let state = new Map({
  users: Map(),
  contacts: Map(),
  phones: Map()
});


const users = [
  { _id: 'u1', name: 'User1', contacts: [ 'c1', 'c3' ] },
  { _id: 'u2', name: 'User2', contacts: ['c2'] }
];

const contacts = [
  { _id: 'c1', name: 'Contact 1', phones: ['p2'] },
  { _id: 'c2', name: 'Contact 2', phones: ['p1', 'p3'] },
  { _id: 'c3', name: 'Contact 3', phones: ['p4'] }
];

const phones = [
  { _id: 'p1', name: 'Phone 1' },
  { _id: 'p2', name: 'Phone 2' },
  { _id: 'p3', name: 'Phone 3' },
  { _id: 'p4', name: 'Phone 4' },
];

state = state
  .mergeIn(['users'], fromJS(users.map(user => [user._id, user])))
  .mergeIn(['contacts'], fromJS(contacts.map(contact => [contact._id, contact])))
  .mergeIn(['phones'], fromJS(phones.map(phone => [phone._id, phone])));

describe('Graph reselect', () => {
  it('should query graph data', () => {
    const query = {
      type: 'array',
      getIn: ['users'],
      filter: {},
      map: {
        contacts: {
          getIn: ['contacts'],
          filter: {},
          map: {
            phones: {
              getIn: ['phones'],
              filter: {},
              map: {}
            }
          }
        }
      }
    };

    const usersSelector = generateGraphSelector(query, {});
    const users = usersSelector(state);

    const usersToCompare = fromJS([
      {
        _id: 'u1',
        name: 'User1',
        contacts: [
          {
            _id: 'c1',
            name: 'Contact 1',
            phones: [
              {
                _id: 'p2',
                name: 'Phone 2'
              }
            ]
          },
          {
            _id: 'c3',
            name: 'Contact 3',
            phones: [
              {
                _id: 'p4',
                name: 'Phone 4'
              }
            ]
          }
        ]
      },
      {
        _id: 'u2',
        name: 'User2',
        contacts: [
          {
            _id: 'c2',
            name: 'Contact 2',
            phones: [
              {
                _id: 'p1',
                name: 'Phone 1'
              },
              {
                _id: 'p3',
                name: 'Phone 3'
              }
            ]
          }
        ]
      }
    ]);

    expect(users.equals(usersToCompare)).to.be.true
  })
});
