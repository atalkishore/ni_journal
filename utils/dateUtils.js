function timeNow() {
    let currentTime = new Date();

    let currentOffset = currentTime.getTimezoneOffset();

    let ISTOffset = 330;   // IST offset UTC +5:30

    let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

    // ISTTime now represents the time in IST coordinates
    let obj = { day: ISTTime.getDay(), hour: ISTTime.getHours(), minute: ISTTime.getMinutes() };
    // if (process.env.ENVNAME === 'dev') {
    //     console.log(`IST:- ${ISTTime}`);
    // }
    return obj
}

function getSecondsRemainingBeforeMidnightIST() {
    const nowIST = timeNow();
    const secondsElapsedToday = nowIST.hour * 3600 + nowIST.minute * 60;
    return 86400 - secondsElapsedToday;
}

// Usage

module.exports.timeNow = timeNow;
module.exports.getSecondsRemainingBeforeMidnightIST = getSecondsRemainingBeforeMidnightIST;
