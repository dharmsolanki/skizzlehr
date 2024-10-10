(function () {
  if (localStorage) {
    var today = new Date();
    var date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();

    var date = today.getDate();
    var Year = today.getFullYear();
    var Month = today.getMonth() + 1;
    wikTime(date, Year, Month);
  }
})();

function wikTime(dates, Year, Month) {
  if (Year && Month) {
    const url = `https://api-skizzlehr.tech/attendance/api/v1/my-attendance-calender/${JSON.parse(localStorage["userData"]).employee_id}/?attendance_month=${getMonthName(
      Month
    )}&attendance_year=${Year}`;

    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        authorization: `Bearer ${localStorage["access_token"]}`,
        ["x-dts-schema"]: "https://drcsystems.skizzlehr.com",
        ["content-type"]: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        let todaydata = data?.ouput_data[dates - 1];

        console.log(todaydata);

        if (todaydata?.punches.lenght <= 1) {
          if (todaydata?.checkIn !== "") {
            const startTime = convertTimeToHoursMinutes(todaydata.checkIn);

            const workHoursToFinish = "07:30";
            const endTimeFor3_45 = "03:45";
            const endTimeFor4_00 = "04:00";
            const endTimeFor6_00 = "06:00";

            const finishTimeAfter730 = calculateEndTimeByWorkHours(
              startTime,
              workHoursToFinish
            );
            const workedTimeUntil345 = calculateEndTimeByWorkHours(
              startTime,
              endTimeFor3_45
            );
            const workedTimeUntil430 = calculateEndTimeByWorkHours(
              startTime,
              endTimeFor4_00
            );
            const workedTimeUntil600 = calculateEndTimeByWorkHours(
              startTime,
              endTimeFor6_00
            );

          

            alert(`07:30 Hr ${finishTimeAfter730}\n 06:00 Hr ${workedTimeUntil600}\n 04:30 Hr ${workedTimeUntil430} \n 03:45 Hr ${workedTimeUntil345} `);

          } else {
            console.log(`Worked todaydata.FirstIN not defined`);
          }
        } else {
          const netHours = calculateNetHours(todaydata.punches);
          let sevenHr = calculateRemainingTime(
            convertTimeToHoursMinutes(netHours),
            "07:30",
            convertTimeToHoursMinutes(todaydata.punches.at(-1).punch_time)
          );
          let sixHr = calculateRemainingTime(
            convertTimeToHoursMinutes(netHours),
            "06:00",
            convertTimeToHoursMinutes(todaydata.punches.at(-1).punch_time)
          );
          let HalfDayHr = calculateRemainingTime(
            convertTimeToHoursMinutes(netHours),
            "03:45",
            convertTimeToHoursMinutes(todaydata.punches.at(-1).punch_time)
          );

          alert(`07:30 Hr ${sevenHr.timeDifference}\n 06:00 Hr ${sixHr.timeDifference}\n 03:45 Hr ${HalfDayHr.timeDifference} `);
          
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }
}

//------------------------------------------------------

function getMonthName(monthNumber) {
  switch (monthNumber) {
    case 1:
      return "January";
    case 2:
      return "February";
    case 3:
      return "March";
    case 4:
      return "April";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "July";
    case 8:
      return "August";
    case 9:
      return "September";
    case 10:
      return "October";
    case 11:
      return "November";
    case 12:
      return "December";
    default:
      return "Invalid month number";
  }
}

function secondsToTime(seconds) {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
}

function convertTimeToHoursMinutes(time) {
  const parts = time.split(":");

  return `${parts[0]}:${parts[1]}`;
}

//------------------------------------------------------

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

//------------------------------------------------------

function calculateEndTimeByWorkHours(startTimeStr, workHoursStr) {
  const startTime = parseTime(startTimeStr);
  const [workHours, workMinutes] = workHoursStr.split(":").map(Number);

  startTime.setHours(startTime.getHours() + workHours);
  startTime.setMinutes(startTime.getMinutes() + workMinutes);

  return formatTime(startTime);
}

function calculateWorkedTime(startTimeStr, endTimeStr) {
  const startTime = parseTime(startTimeStr);
  const endTime = parseTime(endTimeStr);

  const diffMilliseconds = endTime - startTime;
  const totalMinutes = Math.floor(diffMilliseconds / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

//------------------------------------------------------

function calculateNetHours(punches) {
  let totalMinutes = 0;
  let punchInTime = null;

  punches.forEach((punch) => {
    const punchDateTime = new Date(`${punch.punch_date}T${punch.punch_time}`);

    if (punch.punch_inout) {
      if (punchInTime) {
        const duration = (punchDateTime - punchInTime) / (1000 * 60);
        totalMinutes += duration;
        punchInTime = null;
      }
    } else {
      punchInTime = punchDateTime;
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    Math.floor(minutes)
  ).padStart(2, "0")}`;
}

//-----
function calculateRemainingTime(breakTime, initialTime, lastintime) {
  const [workHours, workMinutes] = initialTime.split(":").map(Number);
  const difference = getTimeDifference(initialTime, breakTime);
  const sum = addTimes(difference?.hours, difference?.minutes, lastintime);
  const result = {
    totalHours: `${workHours}:${workMinutes}`,
    timeDifference: `${convertTo12HourFormat(sum.hours, sum.minutes)} `,
  };

  return result;
}

function addTimes(hours1, minutes1, timeString2) {
  if ((hours1, minutes1, timeString2)) {
    const [hours2, minutes2] = timeString2.split(":").map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    const totalMinutesSum = totalMinutes1 + totalMinutes2;

    const hoursSum = Math.floor(totalMinutesSum / 60);
    const minutesSum = totalMinutesSum % 60;

    return {
      hours: hoursSum,
      minutes: minutesSum,
    };
  }
}

function getTimeDifference(timeString1, timeString2) {
  const [hours1, minutes1] = timeString1.split(":").map(Number);
  const [hours2, minutes2] = timeString2.split(":").map(Number);

  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;

  const differenceInMinutes = totalMinutes1 - totalMinutes2;

  const hoursDifference = Math.floor(differenceInMinutes / 60);
  const minutesDifference = differenceInMinutes % 60;

  return {
    hours: hoursDifference,
    minutes: minutesDifference,
  };
}

function convertTo12HourFormat(hours, minutes) {
  if (hours !== undefined && minutes !== undefined) {
    let period = "AM";
    let formattedHours = hours;

    if (hours >= 12) {
      period = "PM";
      formattedHours = hours === 12 ? hours : hours - 12;
    }

    if (formattedHours === 0) {
      formattedHours = 12;
    }

    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  } else {
    throw new Error("Invalid hours or minutes");
  }
}
