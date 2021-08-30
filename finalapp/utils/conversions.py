from datetime import datetime
from dateutil import tz


#Return local time from utc time
def utc_to_local_datetime(utc_time) :
    from_zone = tz.tzutc()
    to_zone = tz.tzlocal()

    # Tell the datetime object that it's in UTC time zone since
    # datetime objects are 'naive' by default
    utc_time = utc_time.replace(tzinfo = from_zone)

    # Convert time zone
    local_time = utc_time.astimezone(to_zone)
    return local_time


#Return 'offset-aware' current datetime
def get_aware_current_datetime() :
    current = datetime.now()
    return current.replace(tzinfo = tz.tzlocal())