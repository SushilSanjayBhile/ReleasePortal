// Our Fake API request util.
// This is a front-end-only example. There is no server, but there is a util
// that pretends to connect to one. It exposes individual functions that make
// requests to invididual REST endpoints.
//
// NOTE: I was originally going to make a pseudo-graphql-client.
// For better or worse, though, most developers use REST APIs, and most front-
// end developers don't have control over the server to set up graphql.
// As such, this util mimics a common REST interface.
//
// All of the fake data is held in normalized data files, in /stubs
import find from 'lodash.find';
import pickBy from 'lodash.pickby';
import profiles from '../stubs/profiles';
import friends from '../stubs/friends';
import posts from '../stubs/posts';

// feed
import feed from '../stubs/feed';
import relatedFeedList from '../stubs/related_feed';
import placesFeed from '../stubs/places_feed';
import travelFeed from '../stubs/travel_mood_feed';

// map
import {
  GOOGLE_MAP_NOT_FOUND, DEFAULT_MARKER_PATH, APP_RESERVED_FEED_ID, APP_RESERVED_USER_ID, APP_RESERVED_USER_NAME,
  FOTO_CATEGORY
} from '../constants';

export const api = 'http://192.168.1.31:8080';

export const authenticateUser = ({ authToken }) => {
  // For now, we're hardcore faking this.
  // No matter which auth token they provide, they're going to be
  // authenticated as our main user.
  //
  // TODO: A more sophisticated system, where you can supply different
  // values to select different users (or to represent a failed attempt).
  //
  // TODO: Authenticate with email/pass as well as via remembered token.

  const userId = Object.keys(profiles)[1];
  const user = profiles[userId];
  return user;
}

export const fetchUserProfileData = ({ userName }) => {
  const profile = find(profiles, profile => profile.userName === userName);

  // While we don't need to fetch the user's friends just yet, we do need
  // to know how many friends they have (this info appears early in the
  // profile page). I assume in a real backend this would be denormalized,
  // so that it can be read quickly.
  return {
    profile: {
      ...profile,
      numOfFriends: friends[profile.id].length,
    }
  };
}

export const fetchUserPostsData = ({ userId, pageNum, pageSize }) => {
  const userPosts = pickBy(posts, post => post.authorId === userId);

  return {
    posts: userPosts,
  };
}

export const fetchUserFriendsData = ({
  userId,
  pageNum = 0,
  pageSize = 20,
}) => {
  // We want to fetch both our friends, and the IDs of our friend's friends.
  // This is so we can easily identify mutual friends.
  //
  // This request is significant, so it's paginated. We're never fetching
  // too many friends at 1 time, regardless of how many friends our user has.
  //
  // Let's process this data in a way that's helpful for consumption.
  // We want the state to be something like:
  // {
  //   id: '001' <-- our main user
  //   friendIds: ['002', '003'], <-- our main user's friends
  //   friendProfiles: {
  //     '002': {
  //       firstName: 'Jane',
  //       ...
  //       friendIds: ['004', '005'], <-- our friend's friends.
  //     },
  //     '003': {
  //       id: '003',
  //       firstName: 'John',
  //       ...
  //       friendIds: ['006'],
  //     }
  //   }
  // }

  const friendIds = friends[userId].slice(pageNum * pageSize, pageSize);

  const friendProfiles = pickBy(profiles, profile => {
    return friendIds.includes(profile.id)
  });

  Object.keys(friendProfiles).forEach(profileId => {
    friendProfiles[profileId].friendIds = friends[profileId];
  });

  return {
    userId,
    friendIds,
    friendProfiles,
  }
}

// FEED
export const fetchUserFeed = ({ userId }) => {
  // TODO: fetch latest feed for the userId
  return feed;
}

export const fetchRelatedUserFeedList = ({ userId, feedId }) => {
  // TODO: fetch related feed list for the corresponding feedId and userId
  let data = relatedFeedList.filter(feed => feed.feedId === feedId)[0]
  return data;
}

export const fetchRelatedUserFeed = async ({ userId, feedId }) => {
  // TODO: fetch complete feed which is related to corresponding feedId and userId
  return feed.filter(item => item.id === feedId)[0]
}

export const fetchUserTravel = ({ userId }) => {
  // TODO: fetch latest feed for the userId
  return travelFeed;
}

export const fetchJourney = async places => {
  // TODO: need to sort according to region top feed and arrange. for now, the top likes are arranged in the favorable order.
  // TODO: fetch according to place mentioned
  return placesFeed;
}
export const fetchFeedForPlaces = async places => {
  // TODO: need to sort according to region top feed and arrange. for now, the top likes are arranged in the favorable order.
  // TODO: fetch according to place mentioned
  let combined = [], combinedFood = [];
  placesFeed.feed.forEach(item => {
    combined = combined.concat(item.fotos.map(foto => ({ ...item.user, ...foto })))
  });
  combined.sort((a, b) => (b.likes - a.likes));
  combinedFood = combined.filter(item => item.category === FOTO_CATEGORY.FOOD).sort((a, b) => (b.likes - a.likes))
  return {
    default: placesFeed.feed,
    top: {
      id: APP_RESERVED_FEED_ID,
      user: {
        uid: APP_RESERVED_USER_ID,
        username: APP_RESERVED_USER_NAME,
        userpic: DEFAULT_MARKER_PATH
      },
      combined, combinedFood
    }
  }
}

// MAP
export const fetchGoogleMapRoute = async ({ from, to }) => {
  if (!window.google) {
    return { result: null, status: GOOGLE_MAP_NOT_FOUND }
  }
  // TODO: to create Service to avoid recreation of objects.
  const directionService = new window.google.maps.DirectionsService();
  return new Promise((resolve, reject) => {
    directionService.route({
      origin: from,
      destination: to,
      travelMode: 'DRIVING'
    }, resolve, reject);
  });
}