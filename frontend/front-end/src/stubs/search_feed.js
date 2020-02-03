// search_journey: specifically fotos between 2 places A and B. it will include best solo fotos, entire journey fotos and partial
// journey fotos.
// partial = A, B are part of his journey. 
// complete = A, B is his starting and destination.
// solo= single foto lieing between the partial and complete journey paths.
//        solo profiles will not appear in search profile bar
export default [
    {
        start: {
            name: 'Pittsburgh',
            lat: 40.4312839,
            lng: -80.1205845
        },
        dest: {
            name: 'NewYork',
            lat: 40.6971494,
            lng: -74.2598661
        },
        feed: [
            {
                user: {
                    uid: '4',
                    username: 'Sharang Kulkarni',
                    userpic: 'sharang_kulkarni.jpg'
                },
                id: '100',
                date: '',
                description: '',
                videos: [],
                fotos: [
                    {likes: 700, category: 'place', foto: 'j11.jpg', lat: 40.230330, lng: -79.694881, title:'Sewickley Township', date: ''},
                    {likes: 500, category: 'place', foto: 'j12.jpg', lat: 40.017314, lng: -78.840634, title: 'Stonycreek Township', date: ''},
                    {likes: 100, category: 'stay', foto: 'j13.jpg', lat: 40.011666, lng: -78.126093, title: 'Fulton Hotel', date: ''},
                    {likes: 100, category: 'stay', foto: 'j14.jpg', lat: 40.503699, lng:  -76.489842, title: 'Lebanon Parade', date: ''},
                    {likes: 200, category: 'food', foto: 'j15.jpg', lat: 40.778371, lng: -74.143395, title: 'Jersey Street', date: ''},
                ]
            },
            {
                user: {
                    uid: '6',
                    username: 'Tom Felton',
                    userpic: 'tom_felton.png'
                },
                id: '101',
                date: '',
                description: '',
                videos: [],
                fotos: [
                    {likes: 30, category: 'place', foto: 'j11.jpg', lat: 40.075081, lng: -79.060876, title: 'Somerset', date: ''},
                    {likes: 600, category: 'place', foto: 'j12.jpg', lat: 40.092561, lng: -78.042890, title: 'Fulton',  date: ''},
                    {likes: 50, category: 'food', foto: 'j13.jpg', lat: 40.171233, lng: -77.229284, title: 'Cumberland', date: ''},
                    {likes: 500, category: 'food', foto: 'j14.jpg', lat: 40.177828, lng: -76.446572, title: 'Rapho Restaurent', date: ''},
                    {likes: 500, category: 'stay', foto: 'j15.jpg', lat: 40.050361, lng: -75.140122, title: 'Philadelphia',  date: ''},
                    {likes: 10, category: 'place', foto: 'j16.jpg', lat: 40.332138, lng: -74.414768, title: 'Middle Sex', date: ''},
                    {likes: 100, category: 'place', foto: 'j17.jpg', lat: 40.643917, lng: -74.107991, title: 'Richmond', date: ''}
                ]
            },
            {
                user: {
                    uid: '5',
                    username: 'Alexander Tyrell',
                    userpic: 'alexander_tyrell.png'
                },
                id: '102',
                date: '',
                description: '',
                videos: [],
                fotos: [
                    {likes: 400, category: 'place', foto: 'j11.jpg', lat: 40.065361, lng: -78.387010, title: 'Bedford', date: ''},
                    {likes: 50, category: 'place', foto: 'j12.jpg', lat: 40.290778, lng: -77.362588, title: 'Brenton', date: ''},
                    {likes: 600, category: 'stay', foto: 'j13.jpg', lat: 40.678513, lng: -76.642401, title: 'Schukill',  date: ''},
                    {likes: 350, category: 'food', foto: 'j14.jpg', lat: 40.802647, lng: -75.793489, title: 'Carbon County', date: ''},
                    {likes: 400, category: 'food', foto: 'j15.jpg', lat: 40.730604, lng: -74.503717, title: 'Morris', date: ''},
                ],
                partial: {
                    start: {
                        name: 'Yellowstone National Park',
                        lat: 44.578230,
                        lng: -110.476446
                    },
                    dest: {
                        name: 'Toronto',
                        lat: 43.7181557,
                        lng: -79.5181418
                    },
                }
            },
            {
                user: {
                    uid: '3',
                    username: 'Rushikesh Patil',
                    userpic: 'nataly_osmann.png'
                },
                id: '103',
                date: '',
                description: '',
                videos: [],
                fotos: [
                    {likes: 600, category: 'place', foto: 'j11.jpg', lat: 40.052072, lng: -77.632032, title: 'Franklin', date: ''},
                    {likes: 500, category: 'food', foto: 'j12.jpg', lat: 40.718600, lng: -74.812590, title: 'Hunterdown', date: ''},
                ],
                solo: true
            }
        ]
    }
]