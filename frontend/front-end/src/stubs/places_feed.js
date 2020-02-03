// TODO: some places inside a journey won't have a post, still people should be able to mark that place in their journey package.
// tripoto app image saving url : https://static2.tripoto.com/media/filter/nl/img/789513/TripDocument/1536586299_amber_palace_jaipur2.jpg
// 
export default {
    places: [
        {
            address: 'Pune, India',
            lat: 18.5204,
            lng: 73.8567
        },
        {
            address: 'Jaipur, India',
            lat: 26.9124,
            lng: 75.7873  
        }
    ],
    feed: [
        {
            id: '10',
            user: {
                uid: '9',
                username: 'Tripoto',
                userpic: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/tripoto.jpg`
            },
            description: `Jaipur Trip`,
            date: new Date(),
            fotos: [
                { uid: 9, fotoId: 47, locationId: { local: 0, global: 50}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/1.jpg`, lat: 18.781001, lng: 73.383644, title: '', date: '', description: '' },
                { uid: 9, fotoId: 48, locationId: { local: 1, global: 50}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/2.jpg`, lat: 18.730248, lng: 73.414011, title: 'Tricose Plaze, Lonavala', date: '', description: '' },
                { uid: 9, fotoId: 49, locationId: { local: 2, global: 40}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/3.jpg`, lat: 19.0586819, lng: 72.8366211, title: '', date: '', description: '' },
                { uid: 9, fotoId: 50, locationId: { local: 2, global: 75}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/4.jpg`, lat: 24.7972763, lng: 73.3279229, title: '', date: '', description: '' },


                { uid: 9, fotoId: 51, locationId: { local: 3, global: 78}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/5.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                { uid: 9, fotoId: 52, locationId: { local: 3.1, global: 78}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/6.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                { uid: 9, fotoId: 53, locationId: { local: 3.2, global: 78}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/7.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                { uid: 9, fotoId: 54, locationId: { local: 3.3, global: 78}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/8.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                { uid: 9, fotoId: 55, locationId: { local: 3.4, global: 78}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/9.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                { uid: 9, fotoId: 56, locationId: { local: 3.5, global: 78}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/10.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                { uid: 9, fotoId: 57, locationId: { local: 3.6, global: 78}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/11.jpg`, lat: 25.1795486, lng: 75.8483296, title: 'Seven Wonders, Kota', date: '', description: '' },
                // context remains same as the they are all 'statue fotos' at that spot. 

                { uid: 9, fotoId: 58, locationId: { local: 4, global: 80}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/12.jpg`, lat: 25.9966523, lng: 73.8372745, title: 'Pushkar', date: '', description: '' },
                { uid: 9, fotoId: 59, locationId: { local: 5, global: 80}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/13.jpg`, lat: 25.9966523, lng: 73.8372745, title: 'Pushkar', date: '', description: '' },

                { uid: 9, fotoId: 60, locationId: { local: 6, global: 81}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/14.jpg`, lat: 26.4873591, lng: 74.546641, title: 'Bramhaji Temple, Pushkar', date: '', description: '' },
                { uid: 9, fotoId: 61, locationId: { local: 6, global: 81}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/15.jpg`, lat: 26.4873591, lng: 74.546641, title: 'Bramhaji Temple, Pushkar', date: '', description: '' },
                { uid: 9, fotoId: 62, locationId: { local: 6, global: 81}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/16.jpg`, lat: 26.4873591, lng: 74.546641, title: 'Bramhaji Temple, Pushkar', date: '', description: '' },

                { uid: 9, fotoId: 63, locationId: { local: 7, global: 82}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/17.jpg`, lat: 26.456118, lng: 74.6271068, title: 'Ajmer Dargah Shariff, Ajmer', date: '', description: '' },
                { uid: 9, fotoId: 64, locationId: { local: 7, global: 82}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/18.jpg`, lat: 26.456118, lng: 74.6271068, title: 'Ajmer Dargah Shariff, Ajmer', date: '', description: '' },
                { uid: 9, fotoId: 65, locationId: { local: 7.1, global: 82}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/19.jpg`, lat: 26.456118, lng: 74.6271068, title: 'Ajmer Dargah Shariff, Ajmer', date: '', description: '' },
                // local: 7 represents fotos of dargah from outside and 7.1 from inside. it is very related to dargah with only differnece that foto clikced from inside and outisde
                // so localID is having same context range of 7. context is 'dargah architecture'

                { uid: 9, fotoId: 66, locationId: { local: 8, global: 83}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/20.jpg`, lat: 26.4591784, lng: 74.7013644, title: 'Nareli Jain Temple, Nareli', date: '', description: '' },
                { uid: 9, fotoId: 67, locationId: { local: 8, global: 83}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/21.jpg`, lat: 26.4591784, lng: 74.7013644, title: 'Nareli Jain Temple, Nareli', date: '', description: '' },
                { uid: 9, fotoId: 68, locationId: { local: 8, global: 83}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/22.jpg`, lat: 26.4591784, lng: 74.7013644, title: 'Nareli Jain Temple, Nareli', date: '', description: '' },
                { uid: 9, fotoId: 69, locationId: { local: 8.1, global: 83}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/23.jpg`, lat: 26.4591784, lng: 74.7013644, title: 'Nareli Jain Temple, Nareli', date: '', description: '' },
                // local: 8 represents fotos of temple from outside and 8.1 from inside. it is very related to temple with only differnece that foto clikced from inside and outisde
                // so localID is having same context range of 8. context is 'temple architecture'

                { uid: 9, fotoId: 70, locationId: { local: 9, global: 84}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/24.jpg`, lat:26.9239363, lng: 75.8245551, title: 'Hawa Mahal, Jaipur', date: '', description: '' },

                { uid: 9, fotoId: 71, locationId: { local: 10, global: 85}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/25.jpg`, lat:26.9854865, lng: 75.8491567, title: 'Amer Fort, Amer, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 72, locationId: { local: 11, global: 85}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/26.jpg`, lat:26.9854865, lng: 75.8491567, title: 'Amer Fort, Amer, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 73, locationId: { local: 12, global: 85}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/27.jpg`, lat:26.9854865, lng: 75.8491567, title: 'Amer Fort, Amer, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 74, locationId: { local: 11.1, global: 85}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/28.jpg`, lat:26.9854865, lng: 75.8491567, title: 'Amer Fort, Amer, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 75, locationId: { local: 13, global: 85}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/29.jpg`, lat:26.9854865, lng: 75.8491567, title: 'Amer Fort, Amer, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 76, locationId: { local: 13, global: 85}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/30.jpg`, lat:26.9854865, lng: 75.8491567, title: 'Amer Fort, Amer, Jaipur', date: '', description: '' },

                { uid: 9, fotoId: 77, locationId: { local: 14, global: 86}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/31.jpg`, lat:26.9768692, lng: 75.8250838, title: 'Jal Mahal, Amer, Jaipur', date: '', description: '' },

                { uid: 9, fotoId: 78, locationId: { local: 15, global: 87}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/32.jpg`, lat:26.9257713, lng: 75.8214694, title: 'City Palace, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 79, locationId: { local: 15.1, global: 87}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/33.jpg`, lat:26.9257713, lng: 75.8214694, title: 'City Palace, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 80, locationId: { local: 15.2, global: 87}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/34.jpg`, lat:26.9257713, lng: 75.8214694, title: 'City Palace, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 81, locationId: { local: 15.3, global: 87}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/35.jpg`, lat:26.9257713, lng: 75.8214694, title: 'City Palace, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 82, locationId: { local: 15.4, global: 87}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/36.jpg`, lat:26.9257713, lng: 75.8214694, title: 'City Palace, Jaipur', date: '', description: '' },
                // given same range because the fotos represent differnt entrance gates of the mahal.so the context reamins relevent
                // context is 'entrance gates of Palace'

                { uid: 9, fotoId: 83, locationId: { local: 16, global: 88}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/37.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 84, locationId: { local: 17, global: 88}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/38.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 85, locationId: { local: 18, global: 88}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/39.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 86, locationId: { local: 19, global: 88}, likes: 500, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/40.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 87, locationId: { local: 17.1, global: 88}, likes: 500, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/41.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 88, locationId: { local: 20, global: 88}, likes: 500, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/42.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                { uid: 9, fotoId: 89, locationId: { local: 21, global: 88}, likes: 100, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/Tripoto/Journeys/1/43.jpg`, lat:26.7529749, lng: 75.8192919, title: 'Chokhi Dhani, Jaipur', date: '', description: '' },
                // context is 'chokhi dhani architecture'
            ],
            videos: [
            ]
        },
        {
            id: '11',
            user: {
                uid: '10',
                username: 'Steve Jobs', 
                userpic: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/stevejobs.png`
            },
            description: `Jaipur`,
            date: new Date(),
            fotos: [
                { uid: 7, fotoId: 90, locationId: { local: 0, global: 89}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/1.jpg`, lat: 19.5125754, lng: 72.4030467, title: 'Nani Daman, Daman', date: '', description: '' },
                { uid: 7, fotoId: 91, locationId: { local: 1, global: 89}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/2.jpg`, lat: 19.5125754, lng: 72.4030467, title: 'Nani Daman, Daman', date: '', description: '' },
                { uid: 7, fotoId: 92, locationId: { local: 0.1, global: 90}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/8.jpg`, lat: 22.6370045, lng: 69.0779171, title: 'Vadodara, Gujrat', date: '', description: '' },

                { uid: 7, fotoId: 93, locationId: { local: 0.2, global: 91}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/3.jpg`, lat: 21.9680691, lng: 71.3794314, title: 'Modossa, Gujrat', date: '', description: '' },

                { uid: 7, fotoId: 94, locationId: { local: 0.3, global: 92}, likes: 100, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/7.jpg`, lat: 22.6370045, lng: 69.0779171, title: 'Barmer, Rajasthan', date: '', description: '' },
                { uid: 7, fotoId: 95, locationId: { local: 0.4, global: 93}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/5.jpg`, lat: 23.4231555, lng: 73.5786643, title: 'Jodhpur, Rajasthan', date: '', description: '' },
                { uid: 7, fotoId: 96, locationId: { local: 0.5, global: 93}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/6.jpg`, lat: 23.4231555, lng: 73.5786643, title: 'Jodhpur, Rajasthan', date: '', description: '' },

                { uid: 7, fotoId: 97, locationId: { local: 2, global: 86}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/SteveJobs/Journeys/1/4.jpg`, lat: 22.4756793, lng: 69.3653045, title: 'Mangaliyawas, Ajmer', date: '', description: '' },
            ],
            videos: [
            ]
        },
        {
            id: '12',
            user: {
                uid: '1',
                username: 'Natalie Osmann',
                userpic: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/nataly_osmann.png`
            },
            description: `Jaipur`,
            date: new Date(),
            solo: true,
            fotos: [
                { uid: 1, fotoId: 98, locationId: { local: 0, global: 90}, likes: 500, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/1/1.jpg`, lat: 21.651469, lng: 72.949019, title: 'Bharuch, Gujrat', date: '', description: '' },
                { uid: 1, fotoId: 99, locationId: { local: 1, global: 90}, likes: 600, category: 'food', foto: `${process.env.PUBLIC_URL}/data/fotos/NatalieOsmann/Journeys/1/2.jpg`, lat: 21.4087019, lng: 72.4226411, title: 'Vadodara, Gujrat', date: '', description: '' },
            ]
        },
        {
            id: '13',
            user: {
                uid: '2',
                username: 'Abhijeet Chavan',
                userpic: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/abhijeet_chavan.jpg`
            },
            description: 'Indore Ratlam',
            date: new Date(),
            partial: [
                {
                    address: 'Indore, India',
                    lat: 22.7239117,
                    lng: 75.723763
                },
                {
                    address: 'Ratlam, India',
                    lat: 23.310705,
                    lng: 75.104945
                }
            ],
            fotos: [
                { uid: 2, fotoId: 100, locationId: { local: 1, global: 30}, likes: 510, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/1/1.jpg`, lat: 22.7239117, lng: 75.723763, title: 'Indore, Madhya Pradesh', date: '', description: '' },
                { uid: 2, fotoId: 101, locationId: { local: 2, global: 31}, likes: 610, category: 'place', foto: `${process.env.PUBLIC_URL}/data/fotos/AbhijeetChavan/Journeys/1/2.jpg`, lat: 23.398561, lng: 75.131325, title: 'Ratlam, Madhya Pradesh', date: '', description: '' },
            ]
        }
    ]
}