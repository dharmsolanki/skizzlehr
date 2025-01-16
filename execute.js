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
    var empId = 0;
    fetch('https://api-skizzlehr.tech/api/v1/login-details/', {
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
        if(typeof data.data.employee_id !== 'undefined') {
            empId = data.data.employee_id;
      if (Year && Month && empId > 0) {
        const url = `https://api-skizzlehr.tech/attendance/api/v1/profile-attendance-calender/${empId}/?attendance_month=${getMonthName(
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

            var htmlPunches = '<table class="table"><tr><td><table class="table">';
            if(todaydata.punches.length > 0) {
              htmlPunches += '<thead>';
                htmlPunches += '<tr><th>Time</th><th>In/Out</th></tr>';
              htmlPunches += '</thead>';
              htmlPunches += '<tbody>';
                for(var i in todaydata.punches) {
                  var [hours, minutes] = todaydata.punches[i]['punch_time'].split(':');
                  var hour12 = (hours % 12) || 12;
                  var ampm = hours >= 12 ? 'PM' : 'AM';

                  htmlPunches += '<tr>';
                    htmlPunches += '<td>';
                      htmlPunches += hour12 + ':' + minutes + ' ' + ampm;
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += (todaydata.punches[i]['punch_inout'] ? 'Out' : 'In');
                    htmlPunches += '</td>';
                  htmlPunches += '</tr>';
                }
              htmlPunches += '</tbody>';
            }
            htmlPunches += '</table></td></tr>';

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

                // Get the first modal instance
                var modalInstance = document.querySelector('.modal');
                var modalHeader = modalInstance.querySelector('.modal-header');

                // Show the modal
                modalInstance.style.display = 'block';

                // Update modal header with time information
                htmlPunches += '<tr><td><table class="table">';
                  htmlPunches += '<thead>';
                    htmlPunches += '<tr>';
                      htmlPunches += '<th>Hours</th>';
                      htmlPunches += '<th>Ends</th>';
                      htmlPunches += '<th>Time Remain</th>';
                    htmlPunches += '</tr>';
                  htmlPunches += '</thead>';
                  htmlPunches += '<tbody>';
                    htmlPunches += '<tr>';
                      htmlPunches += '<td>';
                        htmlPunches += '07:30 Hr';
                      htmlPunches += '</td>';
                      htmlPunches += '<td>';
                        htmlPunches += finishTimeAfter730;
                      htmlPunches += '</td>';
                      htmlPunches += '<td>';
                        htmlPunches += '<div class="counter-clock btn btn-primary" id="cclock"></div>';
                      htmlPunches += '</td>';
                    htmlPunches += '</tr>';
                    htmlPunches += '<tr>';
                      htmlPunches += '<td>';
                        htmlPunches += '06:00 Hr';
                      htmlPunches += '</td>';
                      htmlPunches += '<td>';
                        htmlPunches += workedTimeUntil600;
                      htmlPunches += '</td>';
                      htmlPunches += '<td>';
                        htmlPunches += '<div class="counter-clock-6 btn btn-primary"> Under Development :) </div>';
                      htmlPunches += '</td>';
                    htmlPunches += '</tr>';
                    htmlPunches += '<tr>';
                      htmlPunches += '<td>';
                        htmlPunches += '03:45 Hr';
                      htmlPunches += '</td>';
                      htmlPunches += '<td>';
                        htmlPunches += workedTimeUntil345;
                      htmlPunches += '</td>';
                      htmlPunches += '<td>';
                        htmlPunches += '<div class="counter-clock-half btn btn-primary"> Under Development :) </div>';
                      htmlPunches += '</td>';
                    htmlPunches += '</tr>';
                  htmlPunches += '</tbody>';
                htmlPunches += '</table></td></tr></table>';
                modalHeader.innerHTML = htmlPunches;

                var counterClockDiv = document.getElementById('cclock');
                // Close button logic
                var closeButton = modalInstance.querySelector('.btn-outline-primary');
                closeButton.addEventListener('click', function() {
                    modalInstance.style.display = 'none';
                });

                // Time calculation logic
                var startTime2 = new Date();
                var endTimeString = finishTimeAfter730; // Assuming `finishTimeAfter730` is like "07:30"
                var endTimeParts = endTimeString.split(":");
                var endTime = new Date();
                var endHour = parseInt(endTimeParts[0], 10) + 12; // Convert hours to 24-hour format (if needed for PM)
                var endMinutes = parseInt(endTimeParts[1], 10);
                endTime.setHours(endHour, endMinutes, 0);

                // Check if the end time is in the past, adjust to next day if necessary
                if (endTime <= startTime2) {
                    endTime.setDate(endTime.getDate() + 1); // Set end time for the next day
                }

                // Get current hour and minutes
                var startHour = new Date().getHours();
                var startMinutes = new Date().getMinutes();

                // Logic to display "Time's up" if end time has passed
                if (endHour <= startHour && endMinutes <= startMinutes) {
                    counterClockDiv.innerHTML = "Time's up! You can go now!";
                } else {
                    // Start countdown timer
                    var timer = setInterval(function() {
                        var now = new Date();
                        var timeRemaining = endTime - now;

                        // Stop the timer when time is up
                        if (timeRemaining <= 0) {
                            clearInterval(timer);
                            counterClockDiv.innerHTML = "Time's up!";
                            return;
                        }

                        // Calculate hours, minutes, and seconds left
                        var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                        // Update the counter clock display
                        counterClockDiv.innerHTML = hours + "h " + minutes + "m " + seconds + "s ";
                    }, 1000);
                }


                // alert(`07:30 Hr ${finishTimeAfter730}\n 06:00 Hr ${workedTimeUntil600}\n 04:30 Hr ${workedTimeUntil430} \n 03:45 Hr ${workedTimeUntil345} `);

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

              // Get the first modal instance
              var modalInstance = document.querySelector('.modal');
              var modalHeader = modalInstance.querySelector('.modal-header');

              // Show the modal
              modalInstance.style.display = 'block';

              // Update modal header with time information
              htmlPunches += '<tr><td><table class="table">';
                htmlPunches += '<thead>';
                  htmlPunches += '<tr>';
                    htmlPunches += '<th>Hours</th>';
                    htmlPunches += '<th>Ends</th>';
                    htmlPunches += '<th>Time Remain</th>';
                  htmlPunches += '</tr>';
                htmlPunches += '</thead>';
                htmlPunches += '<tbody>';
                  htmlPunches += '<tr>';
                    htmlPunches += '<td>';
                      htmlPunches += '07:30 Hr';
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += sevenHr.timeDifference;
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += '<div class="counter-clock btn btn-primary" id="cclock">00:00</div>';
                    htmlPunches += '</td>';
                  htmlPunches += '</tr>';
                  htmlPunches += '<tr>';
                    htmlPunches += '<td>';
                      htmlPunches += '06:00 Hr';
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += sixHr.timeDifference;
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += '<div class="counter-clock-6 btn btn-primary" id="cclock6">00:00</div>';
                    htmlPunches += '</td>';
                  htmlPunches += '</tr>';
                  htmlPunches += '<tr>';
                    htmlPunches += '<td>';
                      htmlPunches += '03:45 Hr';
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += HalfDayHr.timeDifference;
                    htmlPunches += '</td>';
                    htmlPunches += '<td>';
                      htmlPunches += '<div class="counter-clock-half btn btn-primary" id="cclock-half">00:00</div>';
                    htmlPunches += '</td>';
                  htmlPunches += '</tr>';
                htmlPunches += '</tbody>';
              htmlPunches += '</table></td></tr></table>';
              modalHeader.innerHTML = htmlPunches;

              var counterClockDiv = document.getElementById('cclock');

              // Close button logic
              var closeButton = modalInstance.querySelector('.btn-outline-primary');
              closeButton.addEventListener('click', function() {
                  modalInstance.style.display = 'none';
              });

              // Time calculation logic
              var startTime2 = new Date();
              var endTimeString = convertTo24Hour(sevenHr.timeDifference); // Assuming `sevenHr.timeDifference` is like "07:30"
              var endTimeParts = endTimeString.split(":");
              var endTime = new Date();
              var endHour = parseInt(endTimeParts[0], 10); // Convert hours to 24-hour format (if needed for PM)
              var endMinutes = parseInt(endTimeParts[1], 10);
              endTime.setHours(endHour, endMinutes, 0);

              // Check if the end time is in the past, adjust to next day if necessary
              if (endTime <= startTime2) {
                  endTime.setDate(endTime.getDate() + 1); // Set end time for the next day
              }

              // Get current hour and minutes
              var startHour = new Date().getHours();
              var startMinutes = new Date().getMinutes();

              // Logic to display "Time's up" if end time has passed
              if (endHour <= startHour && endMinutes <= startMinutes) {
                  counterClockDiv.innerHTML = "Time's up! You can go now!";
              } else {
                  // Start countdown timer
                  var timer = setInterval(function() {
                      var now = new Date();
                      var timeRemaining = endTime - now;

                      // Stop the timer when time is up
                      if (timeRemaining <= 0) {
                          clearInterval(timer);
                          counterClockDiv.innerHTML = "Time's up!";
                          return;
                      }

                      // Calculate hours, minutes, and seconds left
                      var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                      var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                      // Update the counter clock display
                      counterClockDiv.innerHTML = hours + "h " + minutes + "m " + seconds + "s ";
                  }, 1000);
              }

              // 6
              var counterClockDiv3 = document.getElementById('cclock6');
              var startTime3 = new Date();
              var endTimeString3 = convertTo24Hour(sixHr.timeDifference); // Assuming `sevenHr.timeDifference` is like "07:30"
              var endTimeParts3 = endTimeString3.split(":");
              var endTime3 = new Date();
              var endHour3 = parseInt(endTimeParts3[0], 10); // Convert hours to 24-hour format (if needed for PM)
              var endMinutes3 = parseInt(endTimeParts3[1], 10);
              endTime3.setHours(endHour3, endMinutes3, 0);

              // Check if the end time is in the past, adjust to next day if necessary
              if (endTime3 <= startTime3) {
                  endTime3.setDate(endTime.getDate() + 1); // Set end time for the next day
              }

              // Get current hour and minutes
              var startHour3 = new Date().getHours();
              var startMinutes3 = new Date().getMinutes();

              // Logic to display "Time's up" if end time has passed
              if (endHour3 < startHour3 || (endHour3 <= startHour3 && endMinutes3 <= startMinutes3)) {
                  counterClockDiv3.innerHTML = "Time's up! You can go now!";
              } else {
                  // Start countdown timer
                  var timer3 = setInterval(function() {
                      var now = new Date();
                      var timeRemaining3 = endTime3 - now;

                      // Stop the timer when time is up
                      if (timeRemaining3 <= 0) {
                          clearInterval(timer3);
                          counterClockDiv3.innerHTML = "Time's up!";
                          return;
                      }

                      // Calculate hours, minutes, and seconds left
                      var hours = Math.floor((timeRemaining3 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      var minutes = Math.floor((timeRemaining3 % (1000 * 60 * 60)) / (1000 * 60));
                      var seconds = Math.floor((timeRemaining3 % (1000 * 60)) / 1000);

                      // Update the counter clock display
                      counterClockDiv3.innerHTML = hours + "h " + minutes + "m " + seconds + "s ";
                  }, 1000);
              }

              // halfday
              var startTime4 = new Date();
              var endTimeString4 = convertTo24Hour(HalfDayHr.timeDifference); // Assuming `sevenHr.timeDifference` is like "07:30"
              var endTimeParts4 = endTimeString4.split(":");
              var endTime4 = new Date();
              var endHour4 = parseInt(endTimeParts4[0], 10); // Convert hours to 24-hour format (if needed for PM)
              var endMinutes4 = parseInt(endTimeParts4[1], 10);
              endTime4.setHours(endHour4, endMinutes4, 0);

              // Check if the end time is in the past, adjust to next day if necessary
              if (endTime4 <= startTime4) {
                  endTime4.setDate(endTime4.getDate() + 1); // Set end time for the next day
              }

              // Get current hour and minutes
              var startHour4 = new Date().getHours();
              var startMinutes4 = new Date().getMinutes();
              var counterClockDiv4 = document.getElementById('cclock-half');
              // Logic to display "Time's up" if end time has passed
              
              if (endHour3 < startHour3 || (endHour4 <= startHour4 && endMinutes4 <= startMinutes4)) {
                  counterClockDiv4.innerHTML = "Time's up! You can go now!";
              } else {
                  // Start countdown timer
                  var timer4 = setInterval(function() {
                      var now = new Date();
                      var timeRemaining4 = endTime4 - now;

                      // Stop the timer when time is up
                      if (timeRemaining4 <= 0) {
                          clearInterval(timer4);
                          counterClockDiv4.innerHTML = "Time's up!";
                          return;
                      }

                      // Calculate hours, minutes, and seconds left
                      var hours = Math.floor((timeRemaining4 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      var minutes = Math.floor((timeRemaining4 % (1000 * 60 * 60)) / (1000 * 60));
                      var seconds = Math.floor((timeRemaining4 % (1000 * 60)) / 1000);

                      // Update the counter clock display
                      counterClockDiv4.innerHTML = hours + "h " + minutes + "m " + seconds + "s ";
                  }, 1000);
              }

              // alert(`07:30 Hr ${sevenHr.timeDifference}\n 06:00 Hr ${sixHr.timeDifference}\n 03:45 Hr ${HalfDayHr.timeDifference} `);
              
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      }
     } 
    });
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

function convertTo24Hour(time) {
    // Create a Date object with the time string
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');

    // Convert to number for easy manipulation
    hours = parseInt(hours, 10);

    // Adjust hours for PM times
    if (modifier === 'PM' && hours !== 12) {
        hours += 12;
    }
    // Adjust hours for 12 AM (midnight)
    if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }

    // Return formatted 24-hour time with leading zero for hours if needed
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}
