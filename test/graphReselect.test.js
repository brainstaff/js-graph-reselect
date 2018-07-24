import { fromJS, Map } from 'immutable';
import { expect } from 'chai';
import {generateGraphSelector} from '../src';

let state = new Map({
  users: Map({
    entities: Map()
  }),
  contacts: Map({
    entities: Map()
  }),
  phones: Map({
    entities: Map()
  })
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
  .mergeIn(['users', 'entities'], fromJS(users.map(user => [user._id, user])))
  .mergeIn(['contacts', 'entities'], fromJS(contacts.map(contact => [contact._id, contact])))
  .mergeIn(['phones', 'entities'], fromJS(phones.map(phone => [phone._id, phone])));

describe('Graph reselect', () => {
  describe('querying', () => {
    it('should query nested graph data', () => {
      const query = {
        type: 'array',
        getIn: ['users', 'entities'],
        filter: {},
        map: {
          contacts: {
            getIn: ['contacts', 'entities'],
            filter: {},
            map: {
              phones: {
                getIn: ['phones', 'entities'],
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
          _id: 'u1', name: 'User1', contacts: [
            {
              _id: 'c1', name: 'Contact 1', phones: [
                { _id: 'p2', name: 'Phone 2' }
              ]
            },
            {
              _id: 'c3', name: 'Contact 3', phones: [
                { _id: 'p4', name: 'Phone 4' }
              ]
            }
          ]
        },
        {
          _id: 'u2', name: 'User2', contacts: [
            {
              _id: 'c2', name: 'Contact 2', phones: [
                {
                  _id: 'p1', name: 'Phone 1'
                },
                {
                  _id: 'p3', name: 'Phone 3'
                }
              ]
            }
          ]
        }
      ]);

      expect(users.equals(usersToCompare)).to.be.true;
    })
  });

  describe('filtering', () => {
    it('should query with filter of type "value"', () => {
      const query = {
        type: 'array',
        getIn: ['users', 'entities'],
        filter: {
          name: { type: 'value', value: 'User1' }
        },
        map: {}
      };

      const usersSelector = generateGraphSelector(query, {});
      const users = usersSelector(state);
      const usersToCompare = fromJS([
        { _id: 'u1', name: 'User1', contacts: [ 'c1', 'c3' ] }
      ]);

      expect(users.equals(usersToCompare)).to.be.true;
    });

    it('should query with filter of type "param"', () => {
      const query = {
        type: 'array',
        getIn: ['users', 'entities'],
        filter: {
          _id: { type: 'param', param: 'userId' }
        },
        map: {}
      };

      const usersSelector = generateGraphSelector(query, { userId: 'u1' });
      const users = usersSelector(state);
      const usersToCompare = fromJS([
        { _id: 'u1', name: 'User1', contacts: [ 'c1', 'c3' ] }
      ]);

      expect(users.equals(usersToCompare)).to.be.true;
    });

    it('should query with filter of type "inArray"', () => {
      const query = {
        type: 'array',
        getIn: ['contacts', 'entities'],
        filter: {
          _id: { type: 'inArray', param: 'contactIds' }
        },
        map: {}
      };

      const contactsSelector = generateGraphSelector(query, { contactIds: ['c1', 'c3'] });
      const contacts = contactsSelector(state);
      const contactsToCompare = fromJS([
        { _id: 'c1', name: 'Contact 1', phones: ['p2'] },
        { _id: 'c3', name: 'Contact 3', phones: ['p4'] }
      ]);

      expect(contacts.equals(contactsToCompare)).to.be.true;
    });
  });
});
