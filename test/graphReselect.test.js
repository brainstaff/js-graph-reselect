import { fromJS, Map } from 'immutable';
import { expect } from 'chai';
import {generateGraphSelector} from '../dist';
import {
  users,
  contacts,
  phones,
  events,
  addresses,
  usersHasContactsHasPhones,
  usersHasEventsAndContactsHasAddresses, usersWithNameUser1, usersWithIdU2, contactsWithIdsC1AndC3
} from './data';

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


state = state
  .mergeIn(['users', 'entities'], fromJS(users.map(user => [user._id, user])))
  .mergeIn(['contacts', 'entities'], fromJS(contacts.map(contact => [contact._id, contact])))
  .mergeIn(['phones', 'entities'], fromJS(phones.map(phone => [phone._id, phone])))
  .mergeIn(['events', 'entities'], fromJS(events.map(event => [event._id, event])))
  .mergeIn(['addresses', 'entities'], fromJS(addresses.map(address => [address._id, address])));

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
      const usersToCompare = fromJS(usersHasContactsHasPhones);

      expect(users.equals(usersToCompare)).to.be.true;
    });
  });

  describe('filtering', () => {

    it('should query with filter of type "lookup"', () => {
      const query = {
        type: 'array',
        getIn: ['users', 'entities'],
        filter: {},
        map: {
          events: {
            type: 'array',
            getIn: ['events', 'entities'],
            filter: {
              user_id: { type: "lookup", foreignField: "_id" },
              _id: { type: 'inArray', param: 'eventsIds' }
            },
            map: {}
          },
          contacts: {
            type: 'array',
            getIn: ['contacts', 'entities'],
            filter: {},
            map: {
              addresses: {
                type: 'array',
                getIn: ['addresses', 'entities'],
                filter: {
                  contact_id: { type: 'lookup', foreignField: '_id' }
                },
                map: {}
              }
            }
          }
        }
      };

      const usersSelector = generateGraphSelector(query, { eventsIds: [ 'e1', 'e3' ] });
      const users = usersSelector(state);

      const usersToCompare = fromJS(usersHasEventsAndContactsHasAddresses);

      expect(users.equals(usersToCompare)).to.be.true;
    });

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
      const usersToCompare = fromJS(usersWithNameUser1);

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

      const usersSelector = generateGraphSelector(query, { userId: 'u2' });
      const users = usersSelector(state);
      const usersToCompare = fromJS(usersWithIdU2);

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
      const contactsToCompare = fromJS(contactsWithIdsC1AndC3);

      expect(contacts.equals(contactsToCompare)).to.be.true;
    });
  });
});
