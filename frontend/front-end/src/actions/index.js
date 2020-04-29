export const FETCH_USER_FRIENDS_REQUEST = 'FETCH_USER_FRIENDS_REQUEST';
export const FETCH_USER_FRIENDS_SUCCESS = 'FETCH_USER_FRIENDS_SUCCESS';
export const FETCH_USER_FRIENDS_FAILURE = 'FETCH_USER_FRIENDS_FAILURE';
export const FETCH_USER_POSTS_REQUEST = 'FETCH_USER_POSTS_REQUEST';
export const FETCH_USER_POSTS_SUCCESS = 'FETCH_USER_POSTS_SUCCESS';
export const FETCH_USER_POSTS_FAILURE = 'FETCH_USER_POSTS_FAILURE';
export const FETCH_USER_PROFILE_REQUEST = 'FETCH_USER_PROFILE_REQUEST';
export const FETCH_USER_PROFILE_SUCCESS = 'FETCH_USER_PROFILE_SUCCESS';
export const FETCH_USER_PROFILE_FAILURE = 'FETCH_USER_PROFILE_FAILURE';
export const MARK_ALL_MESSAGES_AS_READ = 'MARK_ALL_MESSAGES_AS_READ';
export const MARK_ALL_NOTIFICATIONS_AS_READ = 'MARK_ALL_NOTIFICATIONS_AS_READ';
export const TOGGLE_FLYOUT = 'TOGGLE_FLYOUT';
export const VIEW_PROFILE_PAGE = 'VIEW_PROFILE_PAGE';

// FEED Actions
export const FETCH_USER_FEED = 'FETCH_USER_FEED';
export const FETCH_USER_FEED_SUCCESS = 'FETCH_USER_FEED_SUCCESS';
export const FETCH_USER_FEED_FAILURE = 'FETCH_USER_FEED_FAILURE';
export const UPDATE_ACTIVE_FEED = 'UPDATE_ACTIVE_FEED';
export const FETCH_RELATED_USER_FEED_LIST = 'FETCH_RELATED_USER_FEED_LIST';
export const FETCH_RELATED_USER_FEED_LIST_SUCCESS = 'FETCH_RELATED_USER_FEED_LIST_SUCCESS';
export const FETCH_RELATED_USER_FEED_LIST_FAILURE = 'FETCH_RELATED_USER_FEED_LIST_FAILURE';
export const FETCH_RELATED_USER_FEED = 'FETCH_RELATED_USER_FEED';
export const FETCH_RELATED_USER_FEED_SUCCESS = 'FETCH_RELATED_USER_FEED_SUCCESS';
export const FETCH_RELATED_USER_FEED_FAILURE = 'FETCH_RELATED_USER_FEED_FAILURE';
export const FETCH_USER_JOURNEY = 'FETCH_USER_JOURNEY';
export const FETCH_USER_JOURNEY_SUCCESS = 'FETCH_USER_JOURNEY_SUCCESS';
export const FETCH_USER_JOURNEY_FAILURE = 'FETCH_USER_JOURNEY_FAILURE';
export const FETCH_USER_TRAVEL = 'FETCH_USER_TRAVEL';
export const FETCH_USER_TRAVEL_SUCCESS = 'FETCH_USER_TRAVEL_SUCCESS';
export const FETCH_USER_TRAVEL_FAILURE = 'FETCH_USER_TRAVEL_FAILURE';
// MAP Actions
export const UPDATE_MAP = 'UPDATE_MAP';

// MOOD
export const CHANGE_MOOD = 'CHANGE_MOOD';
export const fetchUserFriendsRequest = () => ({
  type: FETCH_USER_FRIENDS_REQUEST,
});

export const fetchUserFriendsSuccess = ({ userId, friendIds, friendProfiles }) => ({
  type: FETCH_USER_FRIENDS_SUCCESS,
  userId,
  friendIds,
  friendProfiles,
});

export const fetchUserFriendsFailure = ({ error }) => ({
  type: FETCH_USER_FRIENDS_FAILURE,
  error,
});

export const fetchUserPostsRequest = () => ({
  type: FETCH_USER_POSTS_REQUEST,
});

export const fetchUserPostsSuccess = ({ posts }) => ({
  type: FETCH_USER_POSTS_SUCCESS,
  posts,
});

export const fetchUserPostsFailure = ({ error }) => ({
  type: FETCH_USER_POSTS_FAILURE,
  error,
});

export const fetchUserProfileRequest = () => ({
  type: FETCH_USER_PROFILE_REQUEST,
});

export const fetchUserProfileSuccess = ({ profile }) => ({
  type: FETCH_USER_PROFILE_SUCCESS,
  profile,
});

export const fetchUserProfileFailure = ({ error }) => ({
  type: FETCH_USER_PROFILE_FAILURE,
  error,
});

export const markAllMessagesAsRead = () => ({
  type: MARK_ALL_MESSAGES_AS_READ,
});

export const markAllNotificationsAsRead = () => ({
  type: MARK_ALL_NOTIFICATIONS_AS_READ,
});

export const toggleFlyout = flyout => ({
  type: TOGGLE_FLYOUT,
  flyout,
});

export const viewProfilePage = ({ userName }) => ({
  type: VIEW_PROFILE_PAGE,
  userName,
})

// FEED
export const fetchUserFeed = userId => ({
  type: FETCH_USER_FEED,
  userId
});
export const fetchUserFeedSuccess = parameters => ({
  type: FETCH_USER_FEED_SUCCESS,
  ...parameters
})
export const fetchUserFeedFailure = parameters => ({
  type: FETCH_USER_FEED_FAILURE,
  ...parameters
})
export const updateActiveFeed = payload => ({
  type: UPDATE_ACTIVE_FEED,
  payload
});
export const fetchRelatedUserFeedList = ({ userId, feedId }) => ({
  type: FETCH_RELATED_USER_FEED_LIST,
  ...{ userId, feedId }
})
export const fetchRelatedUserFeedListSuccess = payload => ({
  type: FETCH_RELATED_USER_FEED_LIST_SUCCESS,
  ...payload
});
export const fetchRelatedUserFeedListFailure = payload => ({
  type: FETCH_RELATED_USER_FEED_LIST_FAILURE,
  ...payload
});
export const fetchRelatedUserFeed = ({ userId, fotoId, feedId, originalFeedId }) => ({
  type: FETCH_RELATED_USER_FEED,
  ...{ userId, fotoId, feedId, originalFeedId }
})
export const fetchRelatedUserFeedSuccess = payload => ({
  type: FETCH_RELATED_USER_FEED_SUCCESS,
  ...payload
});
export const fetchRelatedUserFeedFailure = payload => ({
  type: FETCH_RELATED_USER_FEED_FAILURE,
  ...payload
});

export const fetchUserJourney = parameters => ({
  type: FETCH_USER_JOURNEY,
  ...parameters
});
export const fetchUserJourneySuccess = parameters => ({
  type: FETCH_USER_JOURNEY_SUCCESS,
  ...parameters
})
export const fetchUserJourneyFailure = parameters => ({
  type: FETCH_USER_JOURNEY_FAILURE,
  ...parameters
})
export const fetchUserTravel = userId => ({
  type: FETCH_USER_TRAVEL,
  userId
});
export const fetchUserTravelSuccess = parameters => ({
  type: FETCH_USER_TRAVEL_SUCCESS,
  ...parameters
})
export const fetchUserTravelFailure = parameters => ({
  type: FETCH_USER_TRAVEL_FAILURE,
  ...parameters
})

// MAP
export const updateMap = payload => ({
  type: UPDATE_MAP,
  payload
})

// MOOD
export const changeMood = mood => ({
  type: CHANGE_MOOD,
  mood
})




export const LOG_IN_REQUEST = 'LOG_IN_REQUEST';
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS';
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE';
export const LOG_OUT = 'LOG_OUT';
export const SAVE_RELEASE_BASIC_INFO = 'SAVE_RELEASE_BASIC_INFO';
export const UPDATE_NAV = 'UPDATE_NAV';
export const REMOVE_FROM_NAV = 'REMOVE_FROM_NAV';
export const DELETE_RELEASE = 'DELETE_RELEASE';
export const SAVE_TEST_CASE = 'SAVE_TEST_CASE';
export const SAVE_TEST_CASE_STATUS = 'SAVE_TEST_CASE_STATUS';
export const DELETE_TEST_CASE = 'DELETE_TEST_CASE';
export const RELEASE_CHANGE = 'RELEASE_CHANGE';
export const UPDATE_PRIORITY_DASHBOARD='UPDATE_PRIORITY_DASHBOARD';
export const SAVE_SINGLE_TEST_CASE = 'SAVE_SINGLE_TEST_CASE';
export const SAVE_FEATURES = 'SAVE_FEATURES';
export const SAVE_BUGS = 'SAVE_BUGS';
export const SAVE_SINGLE_FEATURE = 'SAVE_SINGLE_FEATURE';
export const RELEASE_STATUS_PAGE = 'RELEASE_STATUS_PAGE';
export const SAVE_USER_NOTIFICATIONS = 'SAVE_USER_NOTIFICATIONS';
export const FETCH_USER_NOTIFICATIONS = 'FETCH_USER_NOTIFICATIONS';
export const CLEAR_USER_DATA = 'CLEAR_USER_DATA';
export const SAVE_OPEN_WORK = 'SAVE_OPEN_WORK';
export const SAVE_CLOSED_WORK = 'SAVE_CLOSED_WORK';
export const SAVE_USERS = 'SAVE_USERS';
export const UPDATE_TC_EDIT = 'UPDATE_TC_EDIT';
export const SAVE_USER_DETAILS = 'SAVE_USER_DETAILS';
export const SAVE_PENDING_APPROVAL = 'SAVE_PENDING_APPROVAL';
export const SAVE_MULTI_PENDING_APPROVAL = 'SAVE_MULTI_PENDING_APPROVAL';
export const SAVE_MY_REGRESSION = 'SAVE_MY_REGRESSION';
export const SAVE_ASSIGN_TCS = 'SAVE_ASSIGN_TCS';
export const SAVE_MY_PENDING_APPROVAL = 'SAVE_MY_PENDING_APPROVAL';
export const SAVE_OPTIONS = 'SAVE_OPTIONS';
export const SAVE_E2E = 'SAVE_E2E';
export const SAVE_SINGLE_E2E = 'SAVE_SINGLE_E2E';
export const UPDATE_E2E_EDIT = 'UPDATE_E2E_EDIT';
export const UPDATE_SANITY_EDIT = 'UPDATE_SANITY_EDIT';
export const SAVE_LONGEVITY = 'SAVE_LONGEVITY';
export const SAVE_STRESS = 'SAVE_STRESS';
export const logInRequest = payload => ({
  type: LOG_IN_REQUEST,
  payload,
});
export const logInSuccess = payload => ({
  type: LOG_IN_SUCCESS,
  payload
});
export const logInFailure = payload => ({
  type: LOG_IN_FAILURE,
  payload
});
export const logOut = () => ({
  type: LOG_OUT,
});

export const saveReleaseBasicInfo = payload => ({
  type: SAVE_RELEASE_BASIC_INFO,
  payload
});

export const updateNavBar = payload => ({
  type: UPDATE_NAV,
  payload
})
export const removeFromNavBar = payload => ({
  type: REMOVE_FROM_NAV,
  payload
});

export const deleteRelease = payload => ({
  type: DELETE_RELEASE,
  payload
});
export const saveTestCase = payload => ({
  type: SAVE_TEST_CASE,
  payload
});
export const saveTestCaseStatus = payload => ({
  type: SAVE_TEST_CASE_STATUS,
  payload
})
export const deleteTestCase = payload => ({
  type: DELETE_TEST_CASE,
  payload
})
export const releaseChange = payload => ({
  type: RELEASE_CHANGE,
  payload
})
export const updateSelectedPriority = payload => ({
  type: UPDATE_PRIORITY_DASHBOARD,
  payload
})
export const saveSingleTestCase = payload => ({
  type: SAVE_SINGLE_TEST_CASE,
  payload
})
export const updateTCEdit = payload => ({
  type: UPDATE_TC_EDIT,
  payload
})

export const saveFeatures = payload => ({
  type: SAVE_FEATURES,
  payload
})
export const saveBugs = payload => ({
  type: SAVE_BUGS,
  payload
})
export const saveSingleFeature = payload => ({
  type: SAVE_SINGLE_FEATURE,
  payload
})
export const statusPage = payload => ({
  type: RELEASE_STATUS_PAGE,
  payload
})
export const fetchUserNotifications = payload => ({
  type: FETCH_USER_NOTIFICATIONS,
  ...payload
})
export const saveUserNotifications = payload => ({
  type: SAVE_USER_NOTIFICATIONS,
  payload
})
export const clearUserData = () => ({
  type: CLEAR_USER_DATA
})
export const saveOpenWork = (payload) => ({
  type: SAVE_OPEN_WORK,
  payload
})
export const saveClosedWork = (payload) => ({
  type: SAVE_CLOSED_WORK,
  payload
})
export const saveUsers = (payload) => ({
  type: SAVE_USERS,
  payload
})
export const saveUserDetails = (payload) => ({
  type: SAVE_USER_DETAILS,
  payload
});
export const saveUserPendingApproval = (payload) => ({
  type: SAVE_PENDING_APPROVAL,
  payload
})
export const saveMultiPendingApproval = (payload) => ({
  type: SAVE_MULTI_PENDING_APPROVAL,
  payload
})
export const saveUserMyRegression = (payload) => ({
  type: SAVE_MY_REGRESSION,
  payload
});
export const saveAssignTcs = (payload) => ({
  type: SAVE_ASSIGN_TCS,
  payload
})
export const saveUserMyPendingApproval = (payload) => ({
  type: SAVE_MY_PENDING_APPROVAL,
  payload
})
export const saveOptions = (payload) => ({
  type: SAVE_OPTIONS,
  payload
})
export const saveE2E = (payload) => ({
  type: SAVE_E2E,
  payload
})
export const saveSingleE2E = (payload) => ({
  type: SAVE_SINGLE_E2E,
  payload
})
export const updateE2EEdit = (payload) => ({
  type: UPDATE_E2E_EDIT,
  payload
})
export const updateSanityEdit = (payload) => ({
  type: UPDATE_SANITY_EDIT,
  payload
})


export const saveStress = (payload) => ({
  type: SAVE_STRESS,
  payload
})

export const saveLongevity = (payload) => ({
  type: SAVE_LONGEVITY,
  payload
})
