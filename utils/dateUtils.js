function timeNow() {
  const currentTime = new Date();

  const currentOffset = currentTime.getTimezoneOffset();

  const ISTOffset = 330; // IST offset UTC +5:30

  const ISTTime = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000,
  );

  // ISTTime now represents the time in IST coordinates
  const obj = {
    day: ISTTime.getDay(),
    hour: ISTTime.getHours(),
    minute: ISTTime.getMinutes(),
  };
  return obj;
}

function getSecondsRemainingBeforeMidnightIST() {
  const nowIST = timeNow();
  const secondsElapsedToday = nowIST.hour * 3600 + nowIST.minute * 60;
  return 86400 - secondsElapsedToday;
}

// Usage

export { timeNow as timeNow };
export { getSecondsRemainingBeforeMidnightIST as getSecondsRemainingBeforeMidnightIST };
