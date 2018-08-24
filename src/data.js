export const users = [
  { _id: 'u1', name: 'User1', contacts: [ 'c1', 'c3' ] },
  { _id: 'u2', name: 'User2', contacts: ['c2'] }
];

export const events = [
  { _id: 'e1', user_id: 'u1' },
  { _id: 'e2', user_id: 'u2' },
  { _id: 'e3', user_id: 'u2' }
];

export const contacts = [
  { _id: 'c1', name: 'Contact 1', phones: ['p2'] },
  { _id: 'c2', name: 'Contact 2', phones: ['p1', 'p3'] },
  { _id: 'c3', name: 'Contact 3', phones: ['p4'] }
];

export const phones = [
  { _id: 'p1', name: 'Phone 1' },
  { _id: 'p2', name: 'Phone 2' },
  { _id: 'p3', name: 'Phone 3' },
  { _id: 'p4', name: 'Phone 4' },
];

export const addresses = [
  { _id: 'ad1', contact_id: 'c1'},
  { _id: 'ad2', contact_id: 'c2'},
  { _id: 'ad3', contact_id: 'c2'},
  { _id: 'ad4', contact_id: 'c3'},
];

export const usersHasContactsHasPhones = [
  {
    _id: 'u1',
    name: 'User1',
    contacts: [
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
    _id: 'u2',
    name: 'User2',
    contacts: [
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
];

export const usersHasEventsAndContactsHasAddresses = [
  {
    _id: 'u1',
    name: 'User1',
    contacts: [
      {
        _id: 'c1',
        name: 'Contact 1',
        phones: [ 'p2' ],
        addresses: [
          { _id: 'ad1', contact_id: 'c1'},
        ]
      },
      {
        _id: 'c3',
        name: 'Contact 3',
        phones: [ 'p4' ],
        addresses: [
          { _id: 'ad4', contact_id: 'c3'},
        ]
      }
    ],
    events: [
      { _id: 'e1', user_id: 'u1' }
    ]
  },
  {
    _id: 'u2',
    name: 'User2',
    contacts: [
      {
        _id: 'c2',
        name: 'Contact 2',
        phones: [ 'p1', 'p3' ],
        addresses: [
          { _id: 'ad2', contact_id: 'c2'},
          { _id: 'ad3', contact_id: 'c2'}
        ]
      }
    ],
    events: [
      { _id: 'e2', user_id: 'u2' },
      { _id: 'e3', user_id: 'u2' }
    ]
  }
];

export const usersWithNameUser1 = [
  { _id: 'u1', name: 'User1', contacts: [ 'c1', 'c3' ] }
];

export const usersWithIdU2 = [
  { _id: 'u2', name: 'User2', contacts: [ 'c2' ] }
];

export const contactsWithIdsC1AndC3 = [
  { _id: 'c1', name: 'Contact 1', phones: ['p2'] },
  { _id: 'c3', name: 'Contact 3', phones: ['p4'] }
];